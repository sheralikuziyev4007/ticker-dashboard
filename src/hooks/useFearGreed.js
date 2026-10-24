import { useEffect, useState } from 'react'
import { request } from '../utils/api'

const URL = 'https://api.alternative.me/fng/?limit=2'

export const FEAR_GREED_LABELS = {
  'Extreme Fear': 'Крайний страх',
  Fear: 'Страх',
  Neutral: 'Нейтрально',
  Greed: 'Жадность',
  'Extreme Greed': 'Крайняя жадность',
}

/** Индекс страха и жадности (alternative.me): значение 0–100 + вчерашнее для сравнения. */
export function useFearGreed() {
  const [state, setState] = useState({ index: null, status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    request(URL, { signal: controller.signal })
      .then((json) => {
        const [today, yesterday] = json?.data ?? []
        const value = Number(today?.value)
        if (!today || Number.isNaN(value)) throw new Error('bad payload')
        setState({
          status: 'success',
          index: {
            value,
            label: FEAR_GREED_LABELS[today.value_classification] ?? today.value_classification,
            previous: yesterday ? Number(yesterday.value) : null,
          },
        })
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ index: null, status: 'error' })
      })
    return () => controller.abort()
  }, [])

  return state
}
