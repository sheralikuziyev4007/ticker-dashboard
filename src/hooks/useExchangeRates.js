import { useEffect, useState } from 'react'
import { request } from '../utils/api'
import { FALLBACK_RATES } from '../utils/currency'

const RATES_URL = 'https://open.er-api.com/v6/latest/USD'
const STORAGE_KEY = 'ticker:rates'
const MAX_AGE = 6 * 60 * 60 * 1000 // курсы фиата меняются медленно: 6 часов

function readStored() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (parsed && parsed.rates && typeof parsed.time === 'number') return parsed
  } catch {
    // битый JSON — игнорируем
  }
  return null
}

/**
 * Курсы USD -> EUR/RUB/UZS.
 * status: 'live' (свежие) | 'cached' (из localStorage) | 'fallback' (приблизительные)
 */
export function useExchangeRates() {
  const stored = readStored()
  const [state, setState] = useState(() =>
    stored
      ? { rates: { ...FALLBACK_RATES, ...stored.rates }, status: 'cached' }
      : { rates: FALLBACK_RATES, status: 'fallback' },
  )

  useEffect(() => {
    if (stored && Date.now() - stored.time < MAX_AGE) return undefined

    const controller = new AbortController()
    request(RATES_URL, { signal: controller.signal })
      .then((data) => {
        const rates = { USD: 1 }
        for (const code of ['EUR', 'RUB', 'UZS']) {
          if (typeof data?.rates?.[code] === 'number') rates[code] = data.rates[code]
        }
        setState({ rates: { ...FALLBACK_RATES, ...rates }, status: 'live' })
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ rates, time: Date.now() }))
        } catch {
          // localStorage недоступен — не критично
        }
      })
      .catch(() => {
        // Остаёмся на кэше/запасных курсах.
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
