import { useEffect, useState } from 'react'

/** Возвращает значение, обновляющееся не чаще чем раз в `delay` мс. */
export function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
