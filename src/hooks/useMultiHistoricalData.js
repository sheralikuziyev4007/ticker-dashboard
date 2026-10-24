import { useCallback, useEffect, useRef, useState } from 'react'
import { request } from '../utils/api'
import { buildHistoryPath } from './useHistoricalData'

/**
 * История цен сразу для нескольких монет (сравнение на одном графике).
 * Возвращает series: [{ id, points: [{ timestamp, price }] }].
 * Если хотя бы одна монета не загрузилась — это ошибка всего сравнения
 * (частичный график вводил бы в заблуждение).
 */
export function useMultiHistoricalData(coinIds, period, dateRange) {
  const [series, setSeries] = useState([])
  const [status, setStatus] = useState('loading') // loading | success | empty | error
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const key = coinIds.join(',')

  const fetchAll = useCallback(async () => {
    if (coinIds.length === 0) {
      setSeries([])
      setStatus('empty')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('loading')
    setError(null)

    try {
      const results = await Promise.all(
        coinIds.map(async (id) => {
          const path = buildHistoryPath(id, period, dateRange)
          const data = await request(path, { signal: controller.signal })
          const points = (data.prices || []).map(([timestamp, price]) => ({ timestamp, price }))
          return { id, points }
        }),
      )

      setSeries(results)
      setStatus(results.every((r) => r.points.length === 0) ? 'empty' : 'success')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Не удалось загрузить историю цен')
      setStatus('error')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, period, dateRange?.from, dateRange?.to])

  useEffect(() => {
    fetchAll()
    return () => abortRef.current?.abort()
  }, [fetchAll])

  return { series, status, error, refetch: fetchAll }
}
