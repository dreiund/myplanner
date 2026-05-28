export function fmtMin(m: number | null): string {
  if (!m) return '--'
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`
}

export function categoryLabel(c: string): string {
  return { work: '📁 工作', study: '📒 学习', life: '🏃 生活' }[c] || c
}

export function categoryColor(c: string): string {
  return { work: '#2080f0', study: '#f0a020', life: '#18a058' }[c] || '#999'
}
