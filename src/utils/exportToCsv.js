/**
 * Формирует CSV-файл на клиенте и скачивает его через Blob + URL.createObjectURL.
 * rows: массив объектов, например [{ date: '2026-08-01', price: 64213.5 }, ...]
 */
export function exportToCsv(filename, rows) {
  if (!rows || rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escape = (value) => {
    const str = String(value ?? '')
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ]

  const csvContent = lines.join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
