export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDateTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

export function extractDate(datetime: string): string {
  return datetime.length >= 10 ? datetime.substring(0, 10) : datetime
}

export function formatDisplayDateTime(dt: string | null): string {
  if (!dt) return ''
  if (dt.length <= 10) {
    const parts = dt.split('-')
    if (parts.length < 3) return dt
    return `${parseInt(parts[1])}/${parseInt(parts[2])}`
  }
  const [datePart, timePart] = dt.split(' ')
  const parts = datePart.split('-')
  return `${parseInt(parts[1])}/${parseInt(parts[2])} ${timePart}`
}

export function today(): string {
  return formatDate(new Date())
}

export function getWeekRange(date: Date): { start: string; end: string } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: formatDate(monday), end: formatDate(sunday) }
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const lastDay = new Date(year, month, 0).getDate()
  for (let d = 1; d <= lastDay; d++) {
    days.push(new Date(year, month - 1, d))
  }
  return days
}

export function getCalendarGrid(year: number, month: number): (Date | null)[][] {
  const weeks: (Date | null)[][] = []
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

  let currentWeek: (Date | null)[] = []
  for (let i = 0; i < startPad; i++) currentWeek.push(null)

  for (let d = 1; d <= lastDay.getDate(); d++) {
    currentWeek.push(new Date(year, month - 1, d))
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null)
    weeks.push(currentWeek)
  }
  return weeks
}
