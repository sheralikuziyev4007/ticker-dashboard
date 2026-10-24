/**
 * Добавляет позицию в портфель. Если монета уже есть — объединяет:
 * количество суммируется, цена покупки усредняется (средневзвешенная).
 */
export function mergeHolding(holdings, next) {
  const existing = holdings.find((h) => h.id === next.id)
  if (!existing) return [...holdings, next]

  const amount = existing.amount + next.amount
  const buyPriceUsd =
    (existing.amount * existing.buyPriceUsd + next.amount * next.buyPriceUsd) / amount

  return holdings.map((h) => (h.id === next.id ? { ...h, amount, buyPriceUsd } : h))
}

/**
 * Считает строки и итоги портфеля в USD.
 * coinsById — Map id -> данные CoinGecko (current_price, ...).
 * Если цена монеты ещё не загрузилась, позиция помечается pending
 * и не входит в итоги (чтобы не показывать ложный убыток -100%).
 */
export function computePortfolio(holdings, coinsById) {
  const rows = holdings.map((h) => {
    const coin = coinsById.get(h.id)
    const price = coin?.current_price
    const cost = h.amount * h.buyPriceUsd

    if (typeof price !== 'number') {
      return { ...h, coin, price: null, cost, value: null, pnl: null, pnlPercent: null, pending: true }
    }

    const value = h.amount * price
    const pnl = value - cost
    return {
      ...h,
      coin,
      price,
      cost,
      value,
      pnl,
      pnlPercent: cost > 0 ? (pnl / cost) * 100 : null,
      pending: false,
    }
  })

  const ready = rows.filter((r) => !r.pending)
  const totalValue = ready.reduce((sum, r) => sum + r.value, 0)
  const totalCost = ready.reduce((sum, r) => sum + r.cost, 0)
  const totalPnl = totalValue - totalCost

  return {
    rows,
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercent: totalCost > 0 ? (totalPnl / totalCost) * 100 : null,
    hasPending: rows.some((r) => r.pending),
  }
}

export function sanitizeHoldings(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (h) =>
      h &&
      typeof h.id === 'string' &&
      typeof h.amount === 'number' &&
      h.amount > 0 &&
      typeof h.buyPriceUsd === 'number' &&
      h.buyPriceUsd >= 0,
  )
}
