import { useCallback, useEffect, useRef, useState } from 'react'
import { request } from '../utils/api'

const REFRESH_INTERVAL = 60_000 // 60 секунд, как требует ТЗ

/**
 * Загружает список валют с курсами и изменением за 24ч.
 * Автообновление каждые 60 секунд + ручной refetch().
 */
export function useCurrencies(ids = []) {
  const [data, setData] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | refreshing | error
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const fetchCurrencies = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // Если данные уже есть — обновляем «тихо», без скелетона.
    setStatus((prev) => (prev === 'loading' || prev === 'error' ? 'loading' : 'refreshing'))
    setError(null)

    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: '20',
        page: '1',
        sparkline: 'false',
        price_change_percentage: '24h',
      })
      if (ids.length > 0) {
        params.set('ids', ids.join(','))
      }

      const result = await request(`/coins/markets?${params.toString()}`, {
        signal: controller.signal,
      })
      setData(result)
      setStatus('success')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Не удалось загрузить данные')
      setStatus('error')
    }
  }, [ids.join(',')])

  useEffect(() => {
    fetchCurrencies()
    const interval = setInterval(fetchCurrencies, REFRESH_INTERVAL)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchCurrencies])

  return { data, status, error, refetch: fetchCurrencies }
}
