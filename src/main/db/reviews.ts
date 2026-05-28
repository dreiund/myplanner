import { getDb } from '../database'

export interface ReviewRow {
  id: number
  date: string
  content: string | null
  created_at: string
  updated_at: string
}

export function getReviewByDate(date: string): ReviewRow | undefined {
  return getDb().prepare('SELECT * FROM daily_reviews WHERE date = ?').get(date) as ReviewRow | undefined
}

export function saveReview(date: string, content: string): ReviewRow {
  const db = getDb()
  db.prepare(`
    INSERT INTO daily_reviews (date, content)
    VALUES (@date, @content)
    ON CONFLICT(date) DO UPDATE SET
      content = @content,
      updated_at = datetime('now','localtime')
  `).run({ date, content })
  return db.prepare('SELECT * FROM daily_reviews WHERE date = ?').get(date) as ReviewRow
}

export function getReviewsByDateRange(startDate: string, endDate: string): ReviewRow[] {
  return getDb().prepare(
    "SELECT * FROM daily_reviews WHERE date >= ? AND date <= ? ORDER BY date ASC"
  ).all(startDate, endDate) as ReviewRow[]
}
