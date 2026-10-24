import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const marketsResponse = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/btc.png',
    current_price: 64213.5,
    price_change_percentage_24h: 2.34,
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://example.com/eth.png',
    current_price: 3123.1,
    price_change_percentage_24h: -1.12,
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://example.com/usdt.png',
    current_price: 1.0,
    price_change_percentage_24h: 0.01,
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://example.com/sol.png',
    current_price: 148.2,
    price_change_percentage_24h: 5.67,
  },
]

const searchResponse = {
  coins: [
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', thumb: 'https://example.com/doge.png' },
  ],
}

function marketChartResponse() {
  const now = Date.now()
  return {
    prices: Array.from({ length: 24 }, (_, i) => [
      now - (23 - i) * 60 * 60 * 1000,
      64000 + Math.sin(i) * 500,
    ]),
  }
}

let App

beforeEach(async () => {
  localStorage.clear()
  // Reset the module registry on every test so the in-memory request
  // cache inside utils/api.js starts empty — otherwise a cached success
  // from one test can mask a mocked failure in the next.
  vi.resetModules()
  App = (await import('./App')).default

  global.fetch = vi.fn((url) => {
    const u = String(url)
    if (u.includes('/coins/markets')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(marketsResponse),
      })
    }
    if (u.includes('/search?query=')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(searchResponse),
      })
    }
    if (u.includes('/market_chart')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(marketChartResponse()),
      })
    }
    return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App smoke test', () => {
  it('loads currency cards from the API without throwing', async () => {
    render(<App />)

    expect(await screen.findByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getByText('Tether')).toBeInTheDocument()
    expect(screen.getByText('Solana')).toBeInTheDocument()
  })

  it('opens the detail modal with a chart when a card is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    const bitcoinCard = await screen.findByText('Bitcoin')
    await user.click(bitcoinCard)

    // Modal heading uses the same coin name
    const modalHeading = await screen.findByRole('heading', { name: 'Bitcoin' })
    expect(modalHeading).toBeInTheDocument()

    // Chart should eventually render (no "Нет данных" / error state)
    await waitFor(() => {
      expect(screen.queryByText(/Нет данных за выбранный период/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Данные не загрузились/)).not.toBeInTheDocument()
    })
  })

  it('switches chart periods without error', async () => {
    const user = userEvent.setup()
    render(<App />)

    const bitcoinCard = await screen.findByText('Bitcoin')
    await user.click(bitcoinCard)
    await screen.findByRole('heading', { name: 'Bitcoin' })

    const period30d = screen.getByText('30Д')
    await user.click(period30d)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('days=30'),
        expect.anything(),
      )
    })
  })

  it('searches for a coin and toggles it as favorite', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Bitcoin')

    const searchInput = screen.getByPlaceholderText('Найти монету…')
    await user.type(searchInput, 'doge')

    const dogeOption = await screen.findByText('Dogecoin')
    await user.click(dogeOption)

    // favorites persisted to localStorage
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('ticker:favorites'))
      expect(stored).toContain('dogecoin')
    })
  })

  it('renders error state and retries when the market list request fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' }),
    )
    const user = userEvent.setup()
    render(<App />)

    const retryButton = await screen.findByText('Повторить')
    expect(retryButton).toBeInTheDocument()

    const marketCalls = () =>
      global.fetch.mock.calls.filter(([url]) => String(url).includes('/coins/markets')).length
    expect(marketCalls()).toBe(1)

    await user.click(retryButton)
    await waitFor(() => expect(marketCalls()).toBe(2))
  })
})

describe('Новые разделы', () => {
  it('показывает статистику рынка и индекс страха и жадности', async () => {
    const base = global.fetch
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.includes('/global')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: {
                total_market_cap: { usd: 2.5e12 },
                total_volume: { usd: 9e10 },
                market_cap_percentage: { btc: 52.3, eth: 17.1 },
                market_cap_change_percentage_24h_usd: 1.5,
              },
            }),
        })
      }
      if (u.includes('alternative.me')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              data: [
                { value: '72', value_classification: 'Greed' },
                { value: '65', value_classification: 'Greed' },
              ],
            }),
        })
      }
      return base(url)
    })

    render(<App />)
    expect(await screen.findByText('52.3%')).toBeInTheDocument()
    expect(await screen.findByText('Жадность')).toBeInTheDocument()
    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('переключает валюту: цены показываются в евро', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Bitcoin')

    await user.click(screen.getByRole('button', { name: 'EUR' }))
    await waitFor(() => {
      expect(screen.getAllByText(/€/).length).toBeGreaterThan(0)
    })
    expect(localStorage.getItem('ticker:currency')).toBe('EUR')
  })

  it('вкладка «Рынок» показывает лидеров роста и падения', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Bitcoin')

    await user.click(screen.getByRole('tab', { name: 'Рынок' }))
    expect(await screen.findByText(/Лидеры роста за 24ч/)).toBeInTheDocument()
    expect(screen.getByText(/Лидеры падения за 24ч/)).toBeInTheDocument()
  })

  it('создаёт алерт и сохраняет его в localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Bitcoin')

    await user.click(screen.getByRole('tab', { name: 'Алерты' }))
    await user.type(screen.getByLabelText('Монета для алерта'), 'doge')
    await user.click(await screen.findByText('Dogecoin'))
    await user.type(screen.getByLabelText(/Целевая цена/), '0.5')
    await user.click(screen.getByRole('button', { name: 'Создать алерт' }))

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('ticker:alerts'))
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({ coinId: 'dogecoin', direction: 'above', targetUsd: 0.5 })
    })
  })

  it('добавляет позицию в портфель и считает прибыль', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Bitcoin')

    await user.click(screen.getByRole('tab', { name: 'Портфель' }))
    await user.type(screen.getByLabelText('Монета для портфеля'), 'doge')
    await user.click(await screen.findByText('Dogecoin'))
    await user.type(screen.getByLabelText(/Количество/), '10')
    await user.type(screen.getByLabelText(/Цена покупки/), '1')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('ticker:portfolio'))
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({ id: 'dogecoin', amount: 10, buyPriceUsd: 1 })
    })
    // позиция появилась в таблице, а пустое состояние исчезло
    await waitFor(() => expect(screen.queryByText('Портфель пуст')).not.toBeInTheDocument())
  })
})
