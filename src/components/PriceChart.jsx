import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

const dateFormatter = (timestamp) =>
  new Date(timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-surface2 px-3 py-2 shadow-xl">
      <p className="text-[11px] text-text-muted font-mono mb-0.5">
        {new Date(point.timestamp).toLocaleString('ru-RU')}
      </p>
      <p className="text-sm font-mono text-gold">{priceFormatter.format(point.price)}</p>
    </div>
  )
}

export default function PriceChart({ points, status, error, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="h-72 rounded-xl border border-border bg-surface animate-pulse" />
    )
  }

  if (status === 'error') {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (status === 'empty' || points.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center rounded-xl border border-border bg-surface text-text-muted text-sm">
        Нет данных за выбранный период
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
          <CartesianGrid stroke="#232D38" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={dateFormatter}
            stroke="#4C5A68"
            tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            minTickGap={40}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="#4C5A68"
            tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(2)}`}
            width={56}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#D4A24E"
            strokeWidth={2}
            fill="url(#priceFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
