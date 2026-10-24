// Поддерживаемые валюты отображения. Все данные CoinGecko запрашиваются в USD,
// а в нужную валюту конвертируются на клиенте по курсу (см. useExchangeRates).
export const CURRENCIES = [
  { code: 'USD', label: 'USD', locale: 'en-US' },
  { code: 'EUR', label: 'EUR', locale: 'de-DE' },
  { code: 'RUB', label: 'RUB', locale: 'ru-RU' },
  { code: 'UZS', label: 'UZS', locale: 'ru-RU' },
]

// Запасные курсы на случай, если API курсов недоступен. Они ПРИБЛИЗИТЕЛЬНЫЕ:
// интерфейс показывает пометку, пока не загрузятся реальные значения.
export const FALLBACK_RATES = { USD: 1, EUR: 0.92, RUB: 90, UZS: 12_500 }

export const isSupportedCurrency = (code) => CURRENCIES.some((c) => c.code === code)

const localeOf = (code) => CURRENCIES.find((c) => c.code === code)?.locale ?? 'en-US'

// Сколько знаков после запятой показывать: мелкие монеты требуют точности.
function fractionDigits(abs, code) {
  if (code === 'UZS' && abs >= 1) return [0, 0]
  if (abs >= 1) return [2, 2]
  return [2, 6]
}

/** Форматирует уже сконвертированное значение в выбранной валюте. */
export function formatMoney(value, code = 'USD') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const [min, max] = fractionDigits(Math.abs(value), code)
  return new Intl.NumberFormat(localeOf(code), {
    style: 'currency',
    currency: code,
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(value)
}

/** Компактный формат для больших сумм: 1,2 трлн / $1.2T. */
export function formatCompactMoney(value, code = 'USD') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat(localeOf(code), {
    style: 'currency',
    currency: code,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value, { sign = false } = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const prefix = sign && value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}
