import { useCurrency } from '../context/CurrencyContext'
import { formatPercent } from '../utils/currency'

/** Таблица позиций портфеля. */
export default function PortfolioTable({ rows, onRemove }) {
  const { formatPrice } = useCurrency()

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-border font-mono text-[11px] uppercase text-text-faint">
            <th className="px-4 py-3 font-normal">Монета</th>
            <th className="px-4 py-3 font-normal text-right">Кол-во</th>
            <th className="px-4 py-3 font-normal text-right">Покупка</th>
            <th className="px-4 py-3 font-normal text-right">Сейчас</th>
            <th className="px-4 py-3 font-normal text-right">Стоимость</th>
            <th className="px-4 py-3 font-normal text-right">П/У</th>
            <th className="px-2 py-3 w-10">
              <span className="sr-only">Удалить</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isUp = (row.pnl ?? 0) >= 0
            return (
              <tr key={row.id} className="border-b border-border/60 last:border-0 font-mono text-xs">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <img src={row.image} alt="" className="w-5 h-5 rounded-full" />
                    <span className="text-text-primary font-body text-sm">{row.name}</span>
                    <span className="text-text-faint uppercase">{row.symbol}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">{row.amount}</td>
                <td className="px-4 py-3 text-right tabular-nums text-text-muted">
                  {formatPrice(row.buyPriceUsd)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {row.pending ? '…' : formatPrice(row.price)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-text-primary">
                  {row.pending ? '…' : formatPrice(row.value)}
                </td>
                <td className={`px-4 py-3 text-right tabular-nums ${row.pending ? 'text-text-faint' : isUp ? 'text-up' : 'text-down'}`}>
                  {row.pending ? (
                    '…'
                  ) : (
                    <>
                      {row.pnl > 0 ? '+' : ''}
                      {formatPrice(row.pnl)}
                      {row.pnlPercent !== null && (
                        <span className="block text-[10px]">{formatPercent(row.pnlPercent, { sign: true })}</span>
                      )}
                    </>
                  )}
                </td>
                <td className="px-2 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    aria-label={`Удалить ${row.name} из портфеля`}
                    className="text-text-faint hover:text-down transition-colors px-2"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
