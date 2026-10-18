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

    await user.click(retryButton)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
