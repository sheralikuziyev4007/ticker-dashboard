import { useState } from 'react'

const PERIODS = [
  { key: '24h', label: '24Ч' },
  { key: '7d', label: '7Д' },
  { key: '30d', label: '30Д' },
  { key: '1y', label: '1Г' },
]

// 'YYYY-MM-DD' -> unix seconds (UTC). Для даты "до" берём конец дня,
// чтобы выбранный день входил в диапазон целиком.
const toUnix = (value, endOfDay = false) => {
  if (!value) return null
  const start = Math.floor(new Date(`${value}T00:00:00Z`).getTime() / 1000)
  return endOfDay ? start + 86_399 : start
}

const dateInputClass =
  'bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-text-primary focus-visible:outline-gold'

export default function DateRangeFilter({
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  dateError,
}) {
  // Значения инпутов хранятся локально — так их можно сбросить кнопкой ✕.
  const [fromValue, setFromValue] = useState('')
  const [toValue, setToValue] = useState('')

  // Диапазон считается активным только когда заданы обе даты.
  const isRangeActive = Boolean(dateRange?.from && dateRange?.to)

  const applyRange = (nextFrom, nextTo) => {
    const from = toUnix(nextFrom)
    const to = toUnix(nextTo, true)
    onDateRangeChange(nextFrom || nextTo ? { from, to } : null)
  }

  const handleFromChange = (e) => {
    setFromValue(e.target.value)
    applyRange(e.target.value, toValue)
  }

  const handleToChange = (e) => {
    setToValue(e.target.value)
    applyRange(fromValue, e.target.value)
  }

  const clearRange = () => {
    setFromValue('')
    setToValue('')
    onDateRangeChange(null)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex rounded-lg border border-border bg-surface p-1 w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              onPeriodChange(p.key)
              clearRange()
            }}
            className={`px-3 py-1.5 rounded-md font-mono text-xs transition-colors ${
              period === p.key && !isRangeActive
                ? 'bg-gold text-ink'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={fromValue}
          onChange={handleFromChange}
          className={dateInputClass}
          aria-label="Дата от"
        />
        <span className="text-text-faint text-xs">—</span>
        <input
          type="date"
          value={toValue}
          onChange={handleToChange}
          className={dateInputClass}
          aria-label="Дата до"
        />
        {(fromValue || toValue) && (
          <button
            type="button"
            onClick={clearRange}
            aria-label="Сбросить даты"
            className="text-text-faint hover:text-text-primary text-xs font-mono"
          >
            ✕
          </button>
        )}
      </div>

      {dateError && <p className="text-down text-xs font-mono">{dateError}</p>}
    </div>
  )
}
