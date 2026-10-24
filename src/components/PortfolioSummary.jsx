import { useCurrency } from '../context/CurrencyContext'
import { formatPercent } from '../utils/currency'
import StatCard from './StatCard'

/** Итоги портфеля: текущая стоимость, вложено, прибыль/убыток. */
export default function PortfolioSummary({ totals }) {
  const { formatPrice } = useCurrency()
  const { totalValue, totalCost, totalPnl, totalPnlPercent } = totals
  const isUp = totalPnl >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <StatCard label="Стоимость портфеля" value={formatPrice(totalValue)} />
      <StatCard label="Вложено" value={formatPrice(totalCost)} />
      <StatCard
        label="Прибыль / убыток"
        value={`${totalPnl > 0 ? '+' : ''}${formatPrice(totalPnl)}`}
        hint={totalPnlPercent === null ? null : formatPercent(totalPnlPercent, { sign: true })}
        hintTone={isUp ? 'up' : 'down'}
      />
    </div>
  )
}
