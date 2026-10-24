import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'
import { useCurrency } from '../context/CurrencyContext'
import { mergeSeries } from '../utils/mergeSeries'

const dateFormatter = (timestamp) =>
  new Date(timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })

const tickStyle = { fontSize: 11, fontFamily: 'IBM Plex Mono' }

function SingleTooltip({ active, payload }) {
  const { formatPrice } = useCurrency()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-surface2 px-3 py-2 shadow-xl">
      <p className="text-[11px] text-text-muted font-mono mb-0.5">
        {new Date(point.timestamp).toLocaleString('ru-RU')}
      </p>
      <p className="text-sm font-mono text-gold">{formatPrice(point.price)}</p>
    </div>
  )
}

function CompareTooltip({ active, payload, mode }) {
  const { formatPrice } = useCurrency()
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface2 px-3 py-2 shadow-xl">
      <p className="text-[11px] text-text-muted font-mono mb-1">
        {new Date(payload[0].payload.timestamp).toLocaleString('ru-RU')}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs font-mono flex items-center gap-2" style={{ color: entry.color }}>
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="flex-1">{entry.name}</span>
          <span className="tabular-nums">
            {mode === 'percent'
              ? `${entry.value > 0 ? '+' : ''}${entry.value.toFixed(2)}%`
              : formatPrice(entry.value)}
          </span>
        </p>
      ))}
    </div>
  )
}

/**
 * График цены. Два режима:
 *  - points — одна монета (area chart);
 *  - series — несколько монет: [{ id, name, color, points }] (line chart),
 *    mode 'price' (в выбранной валюте) или 'percent' (% изменения от начала периода).
 */
export default function PriceChart({ points = [], series, mode = 'price', status, error, onRetry }) {
  const { formatCompact } = useCurrency()
  const isCompare = Array.isArray(series)

  const merged = useMemo(
    () => (isCompare ? mergeSeries(series, mode) : []),
    [isCompare, series, mode],
  )

  if (status === 'loading') {
    return <div className="h-72 rounded-xl border border-border bg-surface animate-pulse" />
  }

  if (status === 'error') {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  const isEmpty = isCompare ? merged.length === 0 : points.length === 0
  if (status === 'empty' || isEmpty) {
    return (
      <div className="h-72 flex items-center justify-center rounded-xl border border-border bg-surface text-text-muted text-sm">
        Нет данных за выбранный период
      </div>
    )
  }

  const yTick = (v) => (mode === 'percent' && isCompare ? `${v.toFixed(0)}%` : formatCompact(v))
  const commonAxes = (
    <>
      <CartesianGrid stroke="#232D38" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="timestamp"
        tickFormatter={dateFormatter}
        stroke="#4C5A68"
        tick={tickStyle}
        minTickGap={40}
      />
      <YAxis
        domain={['auto', 'auto']}
        stroke="#4C5A68"
        tick={tickStyle}
        tickFormatter={yTick}
        width={76}
      />
    </>
  )

  if (isCompare) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-3" aria-label="Легенда графика">
          {series.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5 font-mono text-xs text-text-muted">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              {s.name}
            </li>
          ))}
        </ul>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              {commonAxes}
              {mode === 'percent' && <ReferenceLine y={0} stroke="#4C5A68" strokeDasharray="4 4" />}
              <Tooltip content={<CompareTooltip mode={mode} />} />
              {series.map((s) => (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="h-72 rounded-xl border border-border bg-surface p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4A24E" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#D4A24E" stopOpacity={0} />
            </linearGradient>
          </defs>
          {commonAxes}
          <Tooltip content={<SingleTooltip />} />
          <Area type="monotone" dataKey="price" stroke="#D4A24E" strokeWidth={2} fill="url(#priceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
