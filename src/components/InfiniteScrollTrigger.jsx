import { useEffect, useRef } from 'react'

/**
 * Бесконечная прокрутка: когда блок-«страж» появляется в зоне видимости, подгружается
 * следующая страница. Кнопка «Показать ещё» остаётся как запасной и доступный вариант
 * (клавиатура, браузеры без IntersectionObserver).
 */
export default function InfiniteScrollTrigger({ hasMore, isLoading, error, onLoadMore, total }) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || !hasMore || isLoading || error) return undefined
    if (typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore()
      },
      { rootMargin: '300px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isLoading, error, onLoadMore])

  if (!hasMore) {
    return (
      <p className="text-center font-mono text-[11px] text-text-faint py-6">
        Показано монет: {total}
      </p>
    )
  }

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 py-6">
      {error && <p className="text-down text-xs font-mono">{error}</p>}
      <button
        type="button"
        onClick={onLoadMore}
        disabled={isLoading}
        className="px-4 py-2 rounded-lg border border-border font-mono text-xs text-text-primary
                   hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Загрузка…' : error ? 'Повторить загрузку' : 'Показать ещё'}
      </button>
    </div>
  )
}
