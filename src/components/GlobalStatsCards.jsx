import { useCurrency } from '../context/CurrencyContext'
import { formatPercent } from '../utils/currency'
import StatCard from './StatCard'

/** Три карточки глобальной статистики рынка (данные CoinGecko /global). */
export default function GlobalStatsCards({ stats, status }) {
  const { formatCompact } = useCurrency()
  const change = stats?.capChange24h

  return (
    <>
      <StatCard
        label="Капитализация рынка"
        status={status}
        value={formatCompact(stats?.totalMarketCapUsd)}
        hint={change === null || change === undefined ? null : `${formatPercent(change, { sign: true })} за 24ч`}
        hintTone={change >= 0 ? 'up' : 'down'}
      />
      <StatCard
        label="Объём за 24ч"
        status={status}
        value={formatCompact(stats?.totalVolumeUsd)}
      />
      <StatCard
        label="Доминация BTC"
        status={status}
        value={stats?.btcDominance === null || stats?.btcDominance === undefined ? '—' : `${stats.btcDominance.toFixed(1)}%`}
        hint={stats?.ethDominance ? `ETH ${stats.ethDominance.toFixed(1)}%` : null}
      >
        <div className="mt-2 h-1.5 rounded-full bg-surface2 overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gold"
            style={{ width: `${Math.min(100, Math.max(0, stats?.btcDominance ?? 0))}%` }}
          />
        </div>
      </StatCard>
    </>
  )
}
