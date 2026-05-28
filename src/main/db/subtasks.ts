import { getDb } from '../database'

export interface SubtaskRow {
  id: number
  task_id: number
  title: string
  status: string
  sort_order: number
}

export function getSubtasksByTask(taskId: number): SubtaskRow[] {
  const db = getDb()
  return db.prepare('SELECT * FROM subtasks WHERE task_id = ? ORDER BY sort_order').all(taskId) as SubtaskRow[]
}

export function createSubtask(data: { task_id: number; title: string; sort_order?: number }): SubtaskRow {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO subtasks (task_id, title, sort_order) VALUES (@task_id, @title, @sort_order)')
  const info = stmt.run({ task_id: data.task_id, title: data.title, sort_order: data.sort_order || 0 })
  return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(info.lastInsertRowid) as SubtaskRow
}

export function updateSubtask(id: number, data: Record<string, unknown>): SubtaskRow {
  const db = getDb()
  const ALLOWED = new Set(['task_id','title','status','sort_order'])
  const keys = Object.keys(data).filter(k => k !== 'id' && ALLOWED.has(k))
  if (keys.length === 0) return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id) as SubtaskRow
  const fields = keys.map(k => `${k} = @${k}`).join(', ')
  db.prepare(`UPDATE subtasks SET ${fields} WHERE id = @id`).run({ ...data, id })
  return db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id) as SubtaskRow
}

export function removeSubtask(id: number): void {
  getDb().prepare('DELETE FROM subtasks WHERE id = ?').run(id)
}
