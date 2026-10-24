import { useMemo, useState } from 'react'
import CurrencyList from './CurrencyList'
import GainersLosers from './GainersLosers'
import InfiniteScrollTrigger from './InfiniteScrollTrigger'
import MarketControls from './MarketControls'
import { useMarketCoins } from '../hooks/useMarketCoins'
import { filterByMovement, sortCoins } from '../utils/marketSort'

/**
 * Раздел «Рынок»: топ монет с бесконечной прокруткой, сортировкой, фильтром
 * и блоком лидеров роста/падения. Сортировка работает по уже загруженным монетам.
 */
export default function MarketView({ isFavorite, onToggleFavorite, onSelectCoin }) {
  const { coins, status, error, hasMore, isLoadingMore, loadMore, refetch } = useMarketCoins()
  const [sortKey, setSortKey] = useState('default')
  const [direction, setDirection] = useState('desc')
  const [movement, setMovement] = useState('all')

  const visibleCoins = useMemo(
    () => sortCoins(filterByMovement(coins, movement), sortKey, direction),
    [coins, movement, sortKey, direction],
  )

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-lg text-text-primary">Рынок</h2>
        <p className="text-text-muted text-xs mt-0.5 font-mono">
          топ по капитализации · загружено {coins.length}
        </p>
      </div>

      {status === 'success' && <GainersLosers coins={coins} onSelectCoin={onSelectCoin} />}

      <MarketControls
        sortKey={sortKey}
        direction={direction}
        movement={movement}
        onSortKeyChange={setSortKey}
        onDirectionChange={setDirection}
        onMovementChange={setMovement}
      />

      <CurrencyList
        coins={visibleCoins}
        status={status}
        error={error}
        onRetry={refetch}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onSelectCoin={onSelectCoin}
        emptyTitle="Ничего не найдено"
        emptyText="Среди загруженных монет нет подходящих. Загрузите ещё или смените фильтр."
      />

      {status === 'success' && (
        <InfiniteScrollTrigger
          hasMore={hasMore}
          isLoading={isLoadingMore}
          error={error}
          onLoadMore={loadMore}
          total={coins.length}
        />
      )}
    </>
  )
}
