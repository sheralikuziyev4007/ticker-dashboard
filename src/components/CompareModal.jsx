import { useEffect, useMemo, useState } from 'react'
import PriceChart from './PriceChart'
import DateRangeFilter from './DateRangeFilter'
import CoinPicker from './CoinPicker'
import { useMultiHistoricalData } from '../hooks/useMultiHistoricalData'

const MAX_COINS = 5
const COLORS = ['#D4A24E', '#3DDC84', '#5B9CF6', '#C77DFF', '#FF8A5C']

/**
 * Сравнение нескольких монет на одном графике.
 * favoriteCoins — кандидаты из избранного; любую другую монету можно добавить поиском.
 */
export default function CompareModal({ favoriteCoins, onClose }) {
  const [selected, setSelected] = useState(() =>
    favoriteCoins.slice(0, 2).map((c) => ({ id: c.id, name: c.name, symbol: c.symbol, image: c.image })),
  )
  const [period, setPeriod] = useState('7d')
  const [dateRange, setDateRange] = useState(null)
  const [mode, setMode] = useState('percent')

  const ids = useMemo(() => selected.map((c) => c.id), [selected])
  const { series, status, error, refetch } = useMultiHistoricalData(ids, period, dateRange)

  const dateError =
    dateRange?.from && dateRange?.to && dateRange.from > dateRange.to
      ? 'Дата "от" не может быть позже даты "до"'
      : null

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Кандидаты: избранное + выбранные через поиск (без дублей).
  const candidates = useMemo(() => {
    const map = new Map()
    favoriteCoins.forEach((c) => map.set(c.id, { id: c.id, name: c.name, symbol: c.symbol, image: c.image }))
    selected.forEach((c) => map.set(c.id, c))
    return [...map.values()]
  }, [favoriteCoins, selected])

  const toggle = (coin) =>
    setSelected((prev) => {
      if (prev.some((c) => c.id === coin.id)) return prev.filter((c) => c.id !== coin.id)
      if (prev.length >= MAX_COINS) return prev
      return [...prev, coin]
    })

  const chartSeries = useMemo(
    () =>
      selected.map((coin, i) => ({
        id: coin.id,
        name: coin.name,
        color: COLORS[i % COLORS.length],
        points: series.find((s) => s.id === coin.id)?.points ?? [],
      })),
    [selected, series],
  )

  const limitReached = selected.length >= MAX_COINS

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Сравнение монет"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-lg text-text-primary leading-none">Сравнение монет</h2>
            <p className="font-mono text-xs text-text-muted mt-1">до {MAX_COINS} монет на одном графике</p>
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

        <div className="flex flex-wrap gap-2 mb-3">
          {candidates.map((coin) => {
            const index = selected.findIndex((c) => c.id === coin.id)
            const isOn = index !== -1
            const disabled = !isOn && limitReached
            return (
              <button
                key={coin.id}
                type="button"
                onClick={() => toggle(coin)}
                disabled={disabled}
                aria-pressed={isOn}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed ${
                    isOn ? 'text-text-primary' : 'border-border text-text-muted hover:text-text-primary'
                  }`}
                style={isOn ? { borderColor: COLORS[index % COLORS.length] } : undefined}
              >
                <img src={coin.image} alt="" className="w-4 h-4 rounded-full" />
                <span className="uppercase">{coin.symbol}</span>
              </button>
            )
          })}
        </div>

        <div className="mb-4 max-w-xs">
          <CoinPicker
            onSelect={(coin) => !limitReached && toggle(coin)}
            excludeIds={ids}
            placeholder={limitReached ? 'Достигнут лимит монет' : 'Добавить другую монету…'}
            label="Добавить монету к сравнению"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <DateRangeFilter
            period={period}
            onPeriodChange={setPeriod}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            dateError={dateError}
          />
          <div className="flex rounded-lg border border-border bg-surface p-0.5 w-fit">
            {[
              { key: 'percent', label: '% изменения' },
              { key: 'price', label: 'Цена' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                aria-pressed={mode === m.key}
                className={`px-3 py-1 rounded-md font-mono text-[11px] transition-colors ${
                  mode === m.key ? 'bg-gold text-ink' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {selected.length === 0 ? (
          <div className="h-72 flex items-center justify-center rounded-xl border border-border bg-surface2 text-text-muted text-sm">
            Выберите хотя бы одну монету
          </div>
        ) : (
          <PriceChart
            series={chartSeries}
            mode={mode}
            status={dateError ? 'error' : status}
            error={dateError || error}
            onRetry={refetch}
          />
        )}
      </div>
    </div>
  )
}
