import { useCurrency } from '../context/CurrencyContext'

export default function CurrencyCard({ coin, isFavorite, onToggleFavorite, onClick }) {
  const { formatPrice, formatCompact } = useCurrency()
  const change = coin.price_change_percentage_24h ?? 0
  const isUp = change >= 0

  // Две независимые кнопки-соседи (а не кнопка внутри кнопки):
  // основная открывает график, вторая — избранное. Enter и Space работают нативно.
  return (
    <div
      className="group relative rounded-xl border border-border bg-surface
                 hover:border-gold-dim hover:bg-surface2 transition-colors"
    >
      <button
        type="button"
        onClick={() => onClick(coin)}
        className="block w-full text-left p-4 rounded-xl cursor-pointer"
      >
        <span className="flex items-center gap-2.5 mb-4">
          <img
            src={coin.image}
            alt=""
            className="w-7 h-7 rounded-full"
            loading="lazy"
          />
          <span>
            <span className="block font-display text-sm text-text-primary leading-none">
              {coin.name}
            </span>
            <span className="block font-mono text-[11px] text-text-muted uppercase tracking-wide mt-1">
              {coin.symbol}
            </span>
          </span>
        </span>

        <span className="block font-mono text-xl text-text-primary mb-1.5 tabular-nums">
          {formatPrice(coin.current_price)}
        </span>

        <span
          className={`inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded ${
            isUp ? 'text-up bg-up/10' : 'text-down bg-down/10'
          }`}
        >
          {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>

        {/* Капитализация и объём есть не во всех ответах API — показываем, только если пришли. */}
        {(coin.market_cap || coin.total_volume) && (
          <span className="mt-3 flex gap-3 font-mono text-[10px] text-text-faint">
            {coin.market_cap ? <span>Кап. {formatCompact(coin.market_cap)}</span> : null}
            {coin.total_volume ? <span>Объём {formatCompact(coin.total_volume)}</span> : null}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onToggleFavorite(coin.id)}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        className={`absolute top-3 right-3 text-sm transition-colors ${
          isFavorite ? 'text-gold' : 'text-text-faint hover:text-gold'
        }`}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  )
}
