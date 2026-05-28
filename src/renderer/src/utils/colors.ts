export type DotColor = 'red' | 'yellow' | 'green' | 'gray' | null

export function getDateDotColor(tasks: { status: string; priority: string }[], hasEdited: boolean): DotColor {
  if (tasks.length === 0) return hasEdited ? 'gray' : null
  const allDone = tasks.every(t => t.status === 'done')
  if (allDone) return 'green'
  const hasHigh = tasks.some(t => t.status !== 'done' && (t.priority === 'high' || t.priority === 'urgent'))
  if (hasHigh) return 'red'
  const hasMedium = tasks.some(t => t.status !== 'done' && t.priority === 'medium')
  if (hasMedium) return 'yellow'
  return null
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: '#d03050',
    high: '#f0a020',
    medium: '#0066cc',
    low: '#18a058'
  }
  return map[priority] || '#999'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    done: '#18a058',
    in_progress: '#0066cc',
    pending: '#999',
    cancelled: '#ccc'
  }
  return map[status] || '#999'
}
