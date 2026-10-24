import { useMemo } from 'react'
import PortfolioForm from './PortfolioForm'
import PortfolioSummary from './PortfolioSummary'
import PortfolioTable from './PortfolioTable'
import ErrorState from './ErrorState'
import { useCurrencies } from '../hooks/useCurrencies'
import { usePortfolio } from '../hooks/usePortfolio'
import { computePortfolio } from '../utils/portfolio'

/** Раздел «Портфель»: позиции в localStorage, текущие цены с CoinGecko, итоги и П/У. */
export default function PortfolioTracker() {
  const { holdings, addHolding, removeHolding } = usePortfolio()
  const ids = useMemo(() => holdings.map((h) => h.id), [holdings])

  const { data, status, error, refetch } = useCurrencies(ids, { enabled: ids.length > 0 })

  const portfolio = useMemo(
    () => computePortfolio(holdings, new Map(data.map((c) => [c.id, c]))),
    [holdings, data],
  )

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-lg text-text-primary">Портфель</h2>
        <p className="text-text-muted text-xs mt-0.5 font-mono">
          данные хранятся только в вашем браузере · цены обновляются каждые 60 сек
        </p>
      </div>

      <PortfolioForm onAdd={addHolding} />

      {holdings.length === 0 ? (
        <div className="text-center py-14 text-text-muted">
          <p className="font-display text-text-primary mb-1">Портфель пуст</p>
          <p className="text-sm">Добавьте монету, количество и цену покупки — посчитаем прибыль и убыток.</p>
        </div>
      ) : status === 'error' && data.length === 0 ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <PortfolioSummary totals={portfolio} />
          {portfolio.hasPending && (
            <p className="text-text-muted text-xs font-mono mb-3">
              Для части монет цена ещё загружается — они пока не входят в итоги.
            </p>
          )}
          <PortfolioTable rows={portfolio.rows} onRemove={removeHolding} />
        </>
      )}
    </>
  )
}
