import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { request } from '../utils/api'

export default function SearchBar({ favorites, onToggleFavorite }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 350)
  const containerRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    request(`/search?query=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((data) => setResults((data.coins || []).slice(0, 8)))
      .catch((err) => {
        if (err.name !== 'AbortError') setResults([])
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Найти монету…"
        className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary
                   placeholder:text-text-faint focus-visible:outline-gold"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-sm">
        ⌕
      </span>

      {isOpen && query.trim() && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-border bg-surface2 shadow-xl overflow-hidden">
          {isLoading && (
            <p className="px-3 py-2.5 text-xs text-text-muted font-mono">Поиск…</p>
          )}
          {!isLoading && results.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-text-muted font-mono">Ничего не найдено</p>
          )}
          {!isLoading &&
            results.map((coin) => {
              const isFav = favorites.includes(coin.id)
              return (
                <button
                  key={coin.id}
                  onClick={() => onToggleFavorite(coin.id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <img src={coin.thumb} alt="" className="w-5 h-5 rounded-full shrink-0" />
                    <span className="truncate text-sm text-text-primary">{coin.name}</span>
                    <span className="text-xs text-text-faint uppercase font-mono shrink-0">
                      {coin.symbol}
                    </span>
                  </span>
                  <span className={`text-sm shrink-0 ${isFav ? 'text-gold' : 'text-text-faint'}`}>
                    {isFav ? '★' : '+ добавить'}
                  </span>
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}
