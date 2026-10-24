// Единая точка входа для запросов к CoinGecko и другим публичным API.
// Публичный API, ключ не требуется для базовых эндпоинтов.
export const API_BASE = 'https://api.coingecko.com/api/v3'

// Простой in-memory кэш, чтобы не дёргать API повторно
// за одни и те же данные в рамках сессии.
const cache = new Map()
const CACHE_TTL = 30_000 // 30 секунд

/**
 * path — либо путь CoinGecko ('/coins/markets?...'),
 * либо абсолютный URL другого API (курсы валют, Fear & Greed).
 */
async function request(path, { signal } = {}) {
  const cached = cache.get(path)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data
  }

  const url = /^https?:\/\//.test(path) ? path : `${API_BASE}${path}`
  const res = await fetch(url, { signal })

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Слишком много запросов к API. Подождите немного и повторите.')
    }
    throw new Error(`Ошибка API: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  cache.set(path, { data, time: Date.now() })
  return data
}

export { request }
