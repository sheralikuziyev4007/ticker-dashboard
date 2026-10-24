// Варианты сортировки списка монет. 'default' — исходный порядок
// (для избранного — порядок добавления, для рынка — по капитализации от API).
export const SORT_OPTIONS = [
  { key: 'default', label: 'По умолчанию' },
  { key: 'market_cap', label: 'Капитализация' },
  { key: 'change', label: 'Изменение за 24ч' },
  { key: 'volume', label: 'Объём торгов' },
]

const FIELD = {
  market_cap: 'market_cap',
  change: 'price_change_percentage_24h',
  volume: 'total_volume',
}

/** Возвращает НОВЫЙ отсортированный массив. Монеты без значения уходят в конец. */
export function sortCoins(coins, sortKey = 'default', direction = 'desc') {
  const field = FIELD[sortKey]
  if (!field) return [...coins]

  const sign = direction === 'asc' ? 1 : -1
  return [...coins].sort((a, b) => {
    const av = a[field]
    const bv = b[field]
    const aMissing = av === null || av === undefined
    const bMissing = bv === null || bv === undefined
    if (aMissing && bMissing) return 0
    if (aMissing) return 1
    if (bMissing) return -1
    return (av - bv) * sign
  })
}

/** movement: 'all' | 'gainers' | 'losers' */
export function filterByMovement(coins, movement = 'all') {
  if (movement === 'gainers') return coins.filter((c) => (c.price_change_percentage_24h ?? 0) > 0)
  if (movement === 'losers') return coins.filter((c) => (c.price_change_percentage_24h ?? 0) < 0)
  return coins
}

export function filterByQuery(coins, query) {
  const q = query.trim().toLowerCase()
  if (!q) return coins
  return coins.filter(
    (c) => c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q),
  )
}

/** Топ-N роста и падения за 24ч среди переданных монет. */
export function getGainersLosers(coins, limit = 5) {
  const withChange = coins.filter(
    (c) => c.price_change_percentage_24h !== null && c.price_change_percentage_24h !== undefined,
  )
  return {
    gainers: sortCoins(withChange, 'change', 'desc')
      .filter((c) => c.price_change_percentage_24h > 0)
      .slice(0, limit),
    losers: sortCoins(withChange, 'change', 'asc')
      .filter((c) => c.price_change_percentage_24h < 0)
      .slice(0, limit),
  }
}
