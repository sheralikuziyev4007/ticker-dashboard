import CurrencyCard from './CurrencyCard'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

export default function CurrencyList({
  coins,
  status,
  error,
  onRetry,
  isFavorite,
  onToggleFavorite,
  onSelectCoin,
  emptyTitle = 'Пока пусто',
  emptyText = 'Добавьте монеты через поиск, чтобы увидеть их здесь.',
}) {
  if (status === 'loading') return <LoadingState />
  if (status === 'error') return <ErrorState message={error} onRetry={onRetry} />

  if (coins.length === 0) {
    return (
      <div className="text-center py-14 text-text-muted">
        <p className="font-display text-text-primary mb-1">{emptyTitle}</p>
        <p className="text-sm">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {coins.map((coin) => (
        <CurrencyCard
          key={coin.id}
          coin={coin}
          isFavorite={isFavorite(coin.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={onSelectCoin}
        />
      ))}
    </div>
  )
}
