import { getDb } from '../database'

export interface FeedbackRow {
  id: number
  task_id: number
  problems: string | null
  optimizations: string | null
  created_at: string
}

export function saveFeedback(taskId: number, problems: string, optimizations: string): FeedbackRow {
  const db = getDb()
  db.prepare(`
    INSERT INTO task_feedback (task_id, problems, optimizations)
    VALUES (@task_id, @problems, @optimizations)
  `).run({ task_id: taskId, problems, optimizations })
  return db.prepare('SELECT * FROM task_feedback WHERE id = last_insert_rowid()').get() as FeedbackRow
}

export function getFeedbackByTask(taskId: number): FeedbackRow | undefined {
  return getDb().prepare('SELECT * FROM task_feedback WHERE task_id = ? ORDER BY created_at DESC LIMIT 1').get(taskId) as FeedbackRow | undefined
}

export function getFeedbackByDate(date: string): FeedbackRow[] {
  return getDb().prepare(`
    SELECT tf.* FROM task_feedback tf
    JOIN tasks t ON t.id = tf.task_id
    WHERE t.planned_date = ? AND t.status = 'done'
    ORDER BY tf.created_at DESC
  `).all(date) as FeedbackRow[]
}

export interface FeedbackWithTaskRow extends FeedbackRow {
  task_title: string
  planned_date: string
}

export function getFeedbackByDateRange(startDate: string, endDate: string): FeedbackWithTaskRow[] {
  return getDb().prepare(`
    SELECT tf.*, t.title as task_title, t.planned_date
    FROM task_feedback tf
    JOIN tasks t ON t.id = tf.task_id
    WHERE t.planned_date >= ? AND t.planned_date <= ?
    ORDER BY t.planned_date ASC, tf.created_at DESC
  `).all(startDate, endDate) as FeedbackWithTaskRow[]
}
