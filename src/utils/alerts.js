/** Алерт срабатывает, когда цена пересекла порог в выбранную сторону. */
export function isAlertTriggered(alert, price) {
  if (typeof price !== 'number' || Number.isNaN(price)) return false
  return alert.direction === 'above' ? price >= alert.targetUsd : price <= alert.targetUsd
}

export const DIRECTION_LABEL = { above: 'выше или равна', below: 'ниже или равна' }

/** Проверка данных из localStorage: битые записи отбрасываются. */
export function sanitizeAlerts(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (a) =>
      a &&
      typeof a.id === 'string' &&
      typeof a.coinId === 'string' &&
      typeof a.targetUsd === 'number' &&
      a.targetUsd > 0 &&
      (a.direction === 'above' || a.direction === 'below'),
  )
}
