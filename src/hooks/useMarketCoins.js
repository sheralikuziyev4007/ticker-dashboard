import { useCallback, useEffect, useRef, useState } from 'react'
import { request } from '../utils/api'

const PER_PAGE = 50
const MAX_PAGES = 5 // до 250 монет — дальше смысла грузить нет, есть поиск

/**
 * Постраничная загрузка рынка (топ по капитализации) для бесконечной прокрутки.
 * Страницы накапливаются в одном массиве; дубликаты по id отбрасываются
 * (рынок меняется между запросами, и монета может «переехать» на соседнюю страницу).
 */
export function useMarketCoins({ enabled = true } = {}) {
  const [coins, setCoins] = useState([])
  const [page, setPage] = useState(0) // сколько страниц уже загружено
  const [status, setStatus] = useState('loading') // loading | success | error
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const abortRef = useRef(null)
  const busyRef = useRef(false)

  const loadPage = useCallback(async (pageNumber, { replace = false } = {}) => {
    if (busyRef.current && !replace) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    busyRef.current = true

    if (replace) setStatus('loading')
    else setIsLoadingMore(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: String(PER_PAGE),
        page: String(pageNumber),
        sparkline: 'false',
        price_change_percentage: '24h',
      })
      const result = await request(`/coins/markets?${params.toString()}`, {
        signal: controller.signal,
      })

      setCoins((prev) => {
        const base = replace ? [] : prev
        const seen = new Set(base.map((c) => c.id))
        return [...base, ...result.filter((c) => !seen.has(c.id))]
      })
      setPage(pageNumber)
      setHasMore(result.length === PER_PAGE && pageNumber < MAX_PAGES)
      setStatus('success')
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Не удалось загрузить рынок')
      // Если первая страница уже есть, ошибка догрузки не должна убирать список.
      setStatus((prev) => (replace || prev !== 'success' ? 'error' : prev))
    } finally {
      busyRef.current = false
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    loadPage(1, { replace: true })
    return () => abortRef.current?.abort()
  }, [enabled, loadPage])

  const loadMore = useCallback(() => {
    if (hasMore && !busyRef.current) loadPage(page + 1)
  }, [hasMore, page, loadPage])

  const refetch = useCallback(() => loadPage(1, { replace: true }), [loadPage])

  return { coins, status, error, hasMore, isLoadingMore, loadMore, refetch }
}
