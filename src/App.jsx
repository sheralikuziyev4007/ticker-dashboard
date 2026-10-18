import { lazy, Suspense, useMemo, useState } from 'react'
import TickerTape from './components/TickerTape'
import SearchBar from './components/SearchBar'
import CurrencyList from './components/CurrencyList'
import { useCurrencies } from './hooks/useCurrencies'
import { useFavorites } from './hooks/useFavorites'

// Модалка с графиком грузится лениво: Recharts не попадает в стартовый бандл.
const CoinDetailModal = lazy(() => import('./components/CoinDetailModal'))

export default function App() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { data, status, error, refetch } = useCurrencies(favorites)
  const [selectedCoin, setSelectedCoin] = useState(null)

  // Список для карточек сохраняет порядок избранного, а не ответа API.
  const orderedCoins = useMemo(() => {
    const byId = new Map(data.map((c) => [c.id, c]))
    return favorites.map((id) => byId.get(id)).filter(Boolean)
  }, [data, favorites])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-up animate-pulse" />
            <h1 className="font-display text-xl text-text-primary tracking-tight">
              Ticker
            </h1>
            <span className="font-mono text-[11px] text-text-faint uppercase hidden sm:inline">
              live market board
            </span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted
                       hover:text-gold hover:border-gold-dim transition-colors"
          >
            ⟳ Обновить
          </button>
        </div>
      </header>

      <TickerTape coins={orderedCoins} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-lg text-text-primary">Избранное</h2>
            <p className="text-text-muted text-xs mt-0.5 font-mono">
              обновление каждые 60 сек · {favorites.length} монет
            </p>
          </div>
          <SearchBar favorites={favorites} onToggleFavorite={toggleFavorite} />
        </div>

        <CurrencyList
          coins={orderedCoins}
          status={status === 'refreshing' ? 'success' : status}
          error={error}
          onRetry={refetch}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          onSelectCoin={setSelectedCoin}
        />
      </main>

      <footer className="border-t border-border py-4">
        <p className="text-center font-mono text-[11px] text-text-faint">
          данные — CoinGecko API
        </p>
      </footer>

      {selectedCoin && (
        <Suspense fallback={null}>
          <CoinDetailModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
        </Suspense>
      )}
    </div>
  )
}
