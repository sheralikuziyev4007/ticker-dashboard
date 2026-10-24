import { useMemo, useState } from 'react'
import SearchBar from './SearchBar'
import CurrencyList from './CurrencyList'
import MarketControls from './MarketControls'
import { filterByMovement, sortCoins } from '../utils/marketSort'

/** Раздел «Избранное»: поиск/добавление монет, сортировка, фильтр, сетка карточек. */
export default function FavoritesView({
  coins,
  status,
  error,
  onRetry,
  favorites,
  isFavorite,
  onToggleFavorite,
  onSelectCoin,
}) {
  const [sortKey, setSortKey] = useState('default')
  const [direction, setDirection] = useState('desc')
  const [movement, setMovement] = useState('all')

  // 'default' сохраняет порядок избранного, а не ответа API.
  const visibleCoins = useMemo(
    () => sortCoins(filterByMovement(coins, movement), sortKey, direction),
    [coins, movement, sortKey, direction],
  )

  const filteredOut = coins.length > 0 && visibleCoins.length === 0

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-display text-lg text-text-primary">Избранное</h2>
          <p className="text-text-muted text-xs mt-0.5 font-mono">
            обновление каждые 60 сек · {favorites.length} монет
          </p>
        </div>
        <SearchBar favorites={favorites} onToggleFavorite={onToggleFavorite} />
      </div>

      {coins.length > 1 && (
        <MarketControls
          sortKey={sortKey}
          direction={direction}
          movement={movement}
          onSortKeyChange={setSortKey}
          onDirectionChange={setDirection}
          onMovementChange={setMovement}
        />
      )}

      <CurrencyList
        coins={visibleCoins}
        status={status}
        error={error}
        onRetry={onRetry}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onSelectCoin={onSelectCoin}
        emptyTitle={filteredOut ? 'Ничего не найдено' : undefined}
        emptyText={filteredOut ? 'Измените фильтр «Растут / Падают».' : undefined}
      />
    </>
  )
}
