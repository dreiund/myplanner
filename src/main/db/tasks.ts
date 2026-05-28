import { getDb } from '../database'

export interface TaskRow {
  id: number
  title: string
  status: string
  priority: string
  category: string
  planned_date: string
  due_date: string | null
  note: string | null
  estimated_min: number | null
  actual_min: number | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export function getTasksByDate(date: string): TaskRow[] {
  const db = getDb()
  return db.prepare('SELECT * FROM tasks WHERE planned_date = ? ORDER BY priority DESC, created_at ASC').all(date) as TaskRow[]
}

export function getTasksByMonth(year: number, month: number): TaskRow[] {
  const db = getDb()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return db.prepare("SELECT * FROM tasks WHERE planned_date LIKE ? ORDER BY planned_date, priority DESC").all(`${prefix}%`) as TaskRow[]
}

export function getTasksByDateRange(startDate: string, endDate: string): TaskRow[] {
  const db = getDb()
  return db.prepare(
    "SELECT * FROM tasks WHERE planned_date >= ? AND planned_date <= ? ORDER BY planned_date ASC, priority DESC"
  ).all(startDate, endDate) as TaskRow[]
}

export function createTask(data: {
  title: string; planned_date: string; priority?: string; category?: string;
  due_date?: string; note?: string; estimated_min?: number
}): TaskRow {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO tasks (title, planned_date, priority, category, due_date, note, estimated_min)
    VALUES (@title, @planned_date, @priority, @category, @due_date, @note, @estimated_min)
  `)
  const info = stmt.run({
    title: data.title,
    planned_date: data.planned_date,
    priority: data.priority || 'medium',
    category: data.category || 'work',
    due_date: data.due_date || null,
    note: data.note || null,
    estimated_min: data.estimated_min || null
  })
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid) as TaskRow
}

export function updateTask(id: number, data: Record<string, unknown>): TaskRow {
  const db = getDb()
  const ALLOWED = new Set(['title','status','priority','category','planned_date','due_date','note','estimated_min','actual_min','completed_at'])
  const keys = Object.keys(data).filter(k => k !== 'id' && ALLOWED.has(k))
  if (keys.length === 0) return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow
  const fields = keys.map(k => `${k} = @${k}`).join(', ')
  const stmt = db.prepare(`UPDATE tasks SET ${fields}, updated_at = datetime('now','localtime') WHERE id = @id`)
  stmt.run({ ...data, id })
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow
}

export function removeTask(id: number): void {
  const db = getDb()
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

export function toggleTaskComplete(id: number): TaskRow {
  const db = getDb()
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined
  if (!task) throw new Error(`Task ${id} not found`)
  if (task.status === 'done') {
    db.prepare("UPDATE tasks SET status = 'pending', completed_at = NULL, updated_at = datetime('now','localtime') WHERE id = ?").run(id)
  } else {
    db.prepare("UPDATE tasks SET status = 'done', completed_at = datetime('now','localtime'), updated_at = datetime('now','localtime') WHERE id = ?").run(id)
  }
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow
}
