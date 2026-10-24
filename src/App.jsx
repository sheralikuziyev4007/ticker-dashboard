import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import TickerTape from './components/TickerTape'
import FavoritesView from './components/FavoritesView'
import MarketView from './components/MarketView'
import PortfolioTracker from './components/PortfolioTracker'
import PriceAlerts from './components/PriceAlerts'
import MarketOverview from './components/MarketOverview'
import CurrencySwitcher from './components/CurrencySwitcher'
import AlertToasts from './components/AlertToasts'
import TabBar from './components/TabBar'
import { CurrencyProvider, useCurrency } from './context/CurrencyContext'
import { useCurrencies } from './hooks/useCurrencies'
import { useFavorites } from './hooks/useFavorites'
import { usePriceAlerts } from './hooks/usePriceAlerts'
import { useAlertWatcher } from './hooks/useAlertWatcher'
import { showNotification } from './utils/notify'

// Модалки с графиками грузятся лениво: Recharts не попадает в стартовый бандл.
const CoinDetailModal = lazy(() => import('./components/CoinDetailModal'))
const CompareModal = lazy(() => import('./components/CompareModal'))

function Dashboard() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { data, status, error, refetch } = useCurrencies(favorites)
  const { formatPrice } = useCurrency()
  const { alerts, addAlert, removeAlert, markTriggered, rearmAlert } = usePriceAlerts()

  const [activeTab, setActiveTab] = useState('favorites')
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  // Список для карточек сохраняет порядок избранного, а не ответа API.
  const orderedCoins = useMemo(() => {
    const byId = new Map(data.map((c) => [c.id, c]))
    return favorites.map((id) => byId.get(id)).filter(Boolean)
  }, [data, favorites])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Срабатывание алерта: помечаем, показываем системное уведомление (если разрешено)
  // и всегда — toast на странице как запасной вариант.
  const handleAlertTriggered = useCallback(
    (alert, price) => {
      markTriggered(alert.id)
      const title = `${alert.name}: цена ${alert.direction === 'above' ? 'выросла' : 'упала'} до порога`
      const body = `Сейчас ${formatPrice(price)} (порог ${formatPrice(alert.targetUsd)})`
      showNotification(title, body, alert.image)
      setToasts((prev) => [
        ...prev,
        { id: `${alert.id}-${Date.now()}`, title, body, image: alert.image },
      ])
    },
    [markTriggered, formatPrice],
  )

  useAlertWatcher(alerts, handleAlertTriggered)

  const tabs = [
    { key: 'favorites', label: 'Избранное' },
    { key: 'market', label: 'Рынок' },
    { key: 'portfolio', label: 'Портфель' },
    { key: 'alerts', label: 'Алерты', badge: alerts.filter((a) => !a.triggeredAt).length },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-up animate-pulse" />
            <h1 className="font-display text-xl text-text-primary tracking-tight">Ticker</h1>
            <span className="font-mono text-[11px] text-text-faint uppercase hidden sm:inline">
              live market board
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CurrencySwitcher />
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted
                         hover:text-gold hover:border-gold-dim transition-colors"
            >
              ⇄ Сравнить
            </button>
            <button
              type="button"
              onClick={refetch}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-text-muted
                         hover:text-gold hover:border-gold-dim transition-colors"
            >
              ⟳ Обновить
            </button>
          </div>
        </div>
      </header>

      <TickerTape coins={orderedCoins} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <MarketOverview />

        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'favorites' && (
            <FavoritesView
              coins={orderedCoins}
              status={status === 'refreshing' ? 'success' : status}
              error={error}
              onRetry={refetch}
              favorites={favorites}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onSelectCoin={setSelectedCoin}
            />
          )}

          {activeTab === 'market' && (
            <MarketView
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onSelectCoin={setSelectedCoin}
            />
          )}

          {activeTab === 'portfolio' && <PortfolioTracker />}

          {activeTab === 'alerts' && (
            <PriceAlerts
              alerts={alerts}
              onAdd={addAlert}
              onRemove={removeAlert}
              onRearm={rearmAlert}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-border py-4">
        <p className="text-center font-mono text-[11px] text-text-faint">
          данные — CoinGecko API · индекс страха и жадности — alternative.me · курсы валют — open.er-api.com
        </p>
      </footer>

      <AlertToasts toasts={toasts} onDismiss={dismissToast} />

      {selectedCoin && (
        <Suspense fallback={null}>
          <CoinDetailModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} />
        </Suspense>
      )}

      {isCompareOpen && (
        <Suspense fallback={null}>
          <CompareModal favoriteCoins={orderedCoins} onClose={() => setIsCompareOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}

export default function App() {
  return (
    <CurrencyProvider>
      <Dashboard />
    </CurrencyProvider>
  )
}
