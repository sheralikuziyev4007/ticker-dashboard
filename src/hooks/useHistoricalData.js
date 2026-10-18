import { useCallback, useEffect, useRef, useState } from 'react'
import { request } from '../utils/api'

const PERIOD_DAYS = {
  '24h': '1',
  '7d': '7',
  '30d': '30',
  '1y': '365',
}

/**
 * Загружает исторические данные цены для графика.
 * Если передан dateRange { from, to } (unix seconds) — используется
 * эндпоинт /market_chart/range, иначе — обычный /market_chart с period.
 */
export function useHistoricalData(coinId, period, dateRange) {
  const [points, setPoints] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const fetchHistory = useCallback(async () => {
    if (!coinId) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)

    try {
      let path
      if (dateRange?.from && dateRange?.to) {
        if (dateRange.from > dateRange.to) {
          throw new Error('Дата "от" не может быть позже даты "до"')
        }
        path = `/coins/${coinId}/market_chart/range?vs_currency=usd&from=${dateRange.from}&to=${dateRange.to}`
      } else {
        const days = PERIOD_DAYS[period] || '7'
        path = `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      }

      const result = await request(path, { signal: controller.signal })
      const prices = result.prices || []

      if (prices.length === 0) {
        setPoints([])
        setStatus('empty')
        return
      }

      setPoints(
        prices.map(([timestamp, price]) => ({
          timestamp,
          date: new Date(timestamp).toISOString(),
          price,
        })),
      )
      setStatus('success')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Не удалось загрузить историю цен')
      setStatus('error')
    }
  }, [coinId, period, dateRange?.from, dateRange?.to])

  useEffect(() => {
    fetchHistory()
    return () => abortRef.current?.abort()
  }, [fetchHistory])

  return { points, status, error, refetch: fetchHistory }
}
