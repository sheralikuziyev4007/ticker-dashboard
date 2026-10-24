import { useCallback, useEffect, useState } from 'react'
import { sanitizeAlerts } from '../utils/alerts'

const STORAGE_KEY = 'ticker:alerts'

function readStored() {
  try {
    return sanitizeAlerts(JSON.parse(localStorage.getItem(STORAGE_KEY)))
  } catch {
    return []
  }
}

/**
 * Ценовые алерты в localStorage. Алерт:
 * { id, coinId, name, symbol, image, targetUsd, direction: 'above'|'below',
 *   createdAt, triggeredAt: number|null }
 */
export function usePriceAlerts() {
  const [alerts, setAlerts] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
    } catch {
      // не критично
    }
  }, [alerts])

  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [
      ...prev,
      {
        ...alert,
        id: `${alert.coinId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
        triggeredAt: null,
      },
    ])
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const markTriggered = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, triggeredAt: Date.now() } : a)))
  }, [])

  const rearmAlert = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, triggeredAt: null } : a)))
  }, [])

  return { alerts, addAlert, removeAlert, markTriggered, rearmAlert }
}
