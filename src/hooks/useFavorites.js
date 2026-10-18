import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ticker:favorites'
const DEFAULT_FAVORITES = ['bitcoin', 'ethereum', 'tether', 'solana']

function readStoredFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_FAVORITES
    const parsed = JSON.parse(raw)
    // Защита от испорченных данных в localStorage: нужен массив строк.
    return Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')
      ? parsed
      : DEFAULT_FAVORITES
  } catch {
    return DEFAULT_FAVORITES
  }
}

/** Хранит список избранных монет (id из CoinGecko) в localStorage. */
export function useFavorites() {
  const [favorites, setFavorites] = useState(readStoredFavorites)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }, [])

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
