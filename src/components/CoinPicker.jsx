import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { request } from '../utils/api'

/**
 * Поиск монеты с выбором (в отличие от SearchBar, который переключает избранное).
 * onSelect получает { id, name, symbol, image }.
 */
export default function CoinPicker({
  onSelect,
  excludeIds = [],
  placeholder = 'Найти монету…',
  label = 'Поиск монеты',
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 350)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      return undefined
    }

    const controller = new AbortController()
    setIsLoading(true)
    request(`/search?query=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((data) => setResults((data.coins || []).slice(0, 8)))
      .catch((err) => {
        if (err.name !== 'AbortError') setResults([])
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [debouncedQuery])

  useEffect(() => {
    const onMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const visible = results.filter((c) => !excludeIds.includes(c.id))

  const choose = (coin) => {
    onSelect({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.large || coin.thumb,
    })
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        value={query}
        aria-label={label}
        onChange={(e) => {
          setQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary
                   placeholder:text-text-faint focus-visible:outline-gold"
      />

      {isOpen && query.trim() && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-border bg-surface2 shadow-xl overflow-hidden">
          {isLoading && <p className="px-3 py-2.5 text-xs text-text-muted font-mono">Поиск…</p>}
          {!isLoading && visible.length === 0 && (
            <p className="px-3 py-2.5 text-xs text-text-muted font-mono">Ничего не найдено</p>
          )}
          {!isLoading &&
            visible.map((coin) => (
              <button
                key={coin.id}
                type="button"
                onClick={() => choose(coin)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface transition-colors"
              >
                <img src={coin.thumb} alt="" className="w-5 h-5 rounded-full shrink-0" />
                <span className="truncate text-sm text-text-primary">{coin.name}</span>
                <span className="text-xs text-text-faint uppercase font-mono shrink-0">{coin.symbol}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
