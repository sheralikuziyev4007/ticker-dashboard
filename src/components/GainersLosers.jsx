import { useMemo } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { formatPercent } from '../utils/currency'
import { getGainersLosers } from '../utils/marketSort'

function MoverColumn({ title, coins, tone, onSelectCoin }) {
  const { formatPrice } = useCurrency()

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className={`font-display text-sm mb-3 ${tone === 'up' ? 'text-up' : 'text-down'}`}>
        {tone === 'up' ? '▲' : '▼'} {title}
      </h3>
      {coins.length === 0 ? (
        <p className="text-xs text-text-muted font-mono">нет данных</p>
      ) : (
        <ul className="space-y-1">
          {coins.map((coin) => (
            <li key={coin.id}>
              <button
                type="button"
                onClick={() => onSelectCoin(coin)}
                className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-surface2 transition-colors"
              >
                <img src={coin.image} alt="" className="w-5 h-5 rounded-full shrink-0" loading="lazy" />
                <span className="font-mono text-xs uppercase text-text-primary w-12 shrink-0">
                  {coin.symbol}
                </span>
                <span className="font-mono text-xs text-text-muted tabular-nums truncate flex-1">
                  {formatPrice(coin.current_price)}
                </span>
                <span className={`font-mono text-xs tabular-nums ${tone === 'up' ? 'text-up' : 'text-down'}`}>
                  {formatPercent(coin.price_change_percentage_24h, { sign: true })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Секция «Лидеры роста / падения» среди загруженных монет рынка. */
export default function GainersLosers({ coins, onSelectCoin }) {
  const { gainers, losers } = useMemo(() => getGainersLosers(coins, 5), [coins])

  return (
    <section aria-label="Лидеры роста и падения" className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
      <MoverColumn title="Лидеры роста за 24ч" coins={gainers} tone="up" onSelectCoin={onSelectCoin} />
      <MoverColumn title="Лидеры падения за 24ч" coins={losers} tone="down" onSelectCoin={onSelectCoin} />
    </section>
  )
}
