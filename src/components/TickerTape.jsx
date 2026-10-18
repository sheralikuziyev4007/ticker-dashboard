const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
})

export default function TickerTape({ coins }) {
  if (!coins || coins.length === 0) return null

  // Дублируем список, чтобы анимация прокрутки была бесшовной (loop -50%).
  const loopCoins = [...coins, ...coins]

  return (
    <div className="relative w-full overflow-hidden border-y border-border bg-surface">
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-ink to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-ink to-transparent z-10 pointer-events-none" />

      <div className="flex w-fit animate-ticker hover:[animation-play-state:paused]">
        {loopCoins.map((coin, i) => {
          const change = coin.price_change_percentage_24h ?? 0
          const isUp = change >= 0
          return (
            <div
              key={`${coin.id}-${i}`}
              className="flex items-center gap-2 px-5 py-2 shrink-0 border-r border-border/60"
            >
              <img src={coin.image} alt="" className="w-4 h-4 rounded-full" />
              <span className="font-mono text-[11px] uppercase text-text-muted">
                {coin.symbol}
              </span>
              <span className="font-mono text-xs text-text-primary tabular-nums">
                {priceFormatter.format(coin.current_price)}
              </span>
              <span
                className={`font-mono text-[11px] ${isUp ? 'text-up' : 'text-down'}`}
              >
                {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
