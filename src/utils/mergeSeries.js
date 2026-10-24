/**
 * Склеивает несколько рядов [{ id, points: [{ timestamp, price }] }] в один
 * массив строк для Recharts: [{ timestamp, bitcoin: 1, ethereum: 2 }, ...].
 *
 * У разных монет метки времени не совпадают до миллисекунды, поэтому точки
 * группируются в «корзины» одинаковой ширины (усредняются внутри корзины).
 *
 * mode:
 *  - 'price'   — значения в USD как есть;
 *  - 'percent' — % изменения относительно первой точки (удобно сравнивать
 *                монеты с разным масштабом цен: BTC и DOGE).
 */
export function mergeSeries(series, mode = 'price', buckets = 120) {
  const filled = (series || []).filter((s) => s.points?.length > 0)
  if (filled.length === 0) return []

  const min = Math.min(...filled.map((s) => s.points[0].timestamp))
  const max = Math.max(...filled.map((s) => s.points[s.points.length - 1].timestamp))
  const step = Math.max((max - min) / buckets, 1)

  const rows = new Map()

  for (const s of filled) {
    const base = s.points[0].price
    const sums = new Map()

    for (const p of s.points) {
      let value = p.price
      if (mode === 'percent') {
        if (!(base > 0)) continue
        value = (p.price / base - 1) * 100
      }
      const idx = Math.round((p.timestamp - min) / step)
      const acc = sums.get(idx) || { sum: 0, count: 0 }
      acc.sum += value
      acc.count += 1
      sums.set(idx, acc)
    }

    for (const [idx, { sum, count }] of sums) {
      const row = rows.get(idx) || { timestamp: Math.round(min + idx * step) }
      row[s.id] = sum / count
      rows.set(idx, row)
    }
  }

  return [...rows.entries()].sort((a, b) => a[0] - b[0]).map(([, row]) => row)
}
