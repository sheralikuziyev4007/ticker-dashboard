import { useCallback, useEffect, useState } from 'react'
import { request } from '../utils/api'

const REFRESH_INTERVAL = 120_000

/** Глобальная статистика рынка: капитализация, объём, доминация BTC. */
export function useGlobalStats() {
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('loading') // loading | success | error

  const load = useCallback(async (signal) => {
    try {
      const { data } = await request('/global', { signal })
      setStats({
        totalMarketCapUsd: data.total_market_cap?.usd ?? null,
        totalVolumeUsd: data.total_volume?.usd ?? null,
        btcDominance: data.market_cap_percentage?.btc ?? null,
        ethDominance: data.market_cap_percentage?.eth ?? null,
        capChange24h: data.market_cap_change_percentage_24h_usd ?? null,
      })
      setStatus('success')
    } catch (err) {
      if (err.name === 'AbortError') return
      setStatus((prev) => (prev === 'success' ? prev : 'error'))
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    const interval = setInterval(() => load(controller.signal), REFRESH_INTERVAL)
    return () => {
      clearInterval(interval)
      controller.abort()
    }
  }, [load])

  return { stats, status }
}
