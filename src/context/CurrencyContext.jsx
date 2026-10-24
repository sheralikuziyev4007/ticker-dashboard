import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useExchangeRates } from '../hooks/useExchangeRates'
import {
  FALLBACK_RATES,
  formatCompactMoney,
  formatMoney,
  isSupportedCurrency,
} from '../utils/currency'

const STORAGE_KEY = 'ticker:currency'

// Значение по умолчанию позволяет рендерить компоненты без провайдера (тесты, Storybook):
// всё показывается в USD.
const CurrencyContext = createContext({
  currency: 'USD',
  setCurrency: () => {},
  rate: 1,
  ratesStatus: 'live',
  convert: (usd) => usd,
  toUsd: (value) => value,
  formatPrice: (usd) => formatMoney(usd, 'USD'),
  formatCompact: (usd) => formatCompactMoney(usd, 'USD'),
})

function readStoredCurrency() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return isSupportedCurrency(value) ? value : 'USD'
  } catch {
    return 'USD'
  }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(readStoredCurrency)
  const { rates, status } = useExchangeRates()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, currency)
    } catch {
      // не критично
    }
  }, [currency])

  const setCurrency = useCallback((code) => {
    if (isSupportedCurrency(code)) setCurrencyState(code)
  }, [])

  const value = useMemo(() => {
    const rate = rates[currency] ?? FALLBACK_RATES[currency] ?? 1
    return {
      currency,
      setCurrency,
      rate,
      ratesStatus: status,
      convert: (usd) => usd * rate,
      toUsd: (amount) => amount / rate,
      formatPrice: (usd) => formatMoney(usd === null || usd === undefined ? usd : usd * rate, currency),
      formatCompact: (usd) =>
        formatCompactMoney(usd === null || usd === undefined ? usd : usd * rate, currency),
    }
  }, [currency, rates, status, setCurrency])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export const useCurrency = () => useContext(CurrencyContext)
