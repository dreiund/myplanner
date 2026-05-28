export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function renderMarkdown(md: string): string {
  // Escape HTML first to prevent XSS from AI output
  let html = escapeHtml(md)
  // Then apply markdown patterns on the escaped text
  html = html.replace(/### (.+)/g, '<h4 style="margin-top:8px">$1</h4>')
  html = html.replace(/## (.+)/g, '<h3>$1</h3>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/^- (.+)/gm, '<li>$1</li>')
  html = html.replace(/\n\n/g, '<br/>')
  html = html.replace(/\n/g, '<br/>')
  return html
}
