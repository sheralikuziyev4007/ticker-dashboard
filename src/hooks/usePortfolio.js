import { useCallback, useEffect, useState } from 'react'
import { mergeHolding, sanitizeHoldings } from '../utils/portfolio'

const STORAGE_KEY = 'ticker:portfolio'

function readStored() {
  try {
    return sanitizeHoldings(JSON.parse(localStorage.getItem(STORAGE_KEY)))
  } catch {
    return []
  }
}

/**
 * Портфель в localStorage. Позиция:
 * { id, name, symbol, image, amount, buyPriceUsd }
 * Цена покупки хранится в USD — это базовая валюта приложения.
 */
export function usePortfolio() {
  const [holdings, setHoldings] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings))
    } catch {
      // не критично
    }
  }, [holdings])

  const addHolding = useCallback((holding) => {
    setHoldings((prev) => mergeHolding(prev, holding))
  }, [])

  const removeHolding = useCallback((id) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }, [])

  return { holdings, addHolding, removeHolding }
}
