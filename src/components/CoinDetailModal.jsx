import { useEffect, useState } from 'react'
import PriceChart from './PriceChart'
import DateRangeFilter from './DateRangeFilter'
import ExportButton from './ExportButton'
import { useHistoricalData } from '../hooks/useHistoricalData'

export default function CoinDetailModal({ coin, onClose }) {
  const [period, setPeriod] = useState('7d')
  const [dateRange, setDateRange] = useState(null)
  const [dateError, setDateError] = useState(null)

  const { points, status, error, refetch } = useHistoricalData(coin.id, period, dateRange)

  useEffect(() => {
    if (dateRange?.from && dateRange?.to && dateRange.from > dateRange.to) {
      setDateError('Дата "от" не может быть позже даты "до"')
    } else {
      setDateError(null)
    }
  }, [dateRange])

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={coin.name}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <img src={coin.image} alt="" className="w-9 h-9 rounded-full" />
            <div>
              <h2 className="font-display text-lg text-text-primary leading-none">{coin.name}</h2>
              <p className="font-mono text-xs text-text-muted uppercase mt-1">{coin.symbol}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="text-text-faint hover:text-text-primary text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <DateRangeFilter
            period={period}
            onPeriodChange={setPeriod}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            dateError={dateError}
          />
          <ExportButton coinName={coin.name} points={points} />
        </div>

        <PriceChart
          points={points}
          status={dateError ? 'error' : status}
          error={dateError || error}
          onRetry={refetch}
        />
      </div>
    </div>
  )
}
