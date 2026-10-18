import { exportToCsv } from '../utils/exportToCsv'

export default function ExportButton({ coinName, points }) {
  const handleExport = () => {
    const rows = points.map((p) => ({
      date: new Date(p.timestamp).toISOString(),
      price_usd: p.price.toFixed(6),
    }))
    const filename = `${coinName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.csv`
    exportToCsv(filename, rows)
  }

  return (
    <button
      onClick={handleExport}
      disabled={points.length === 0}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-mono
                 text-text-primary hover:border-gold hover:text-gold transition-colors
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-primary"
    >
      ⬇ Экспорт CSV
    </button>
  )
}
