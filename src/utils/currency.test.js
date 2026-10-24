import { describe, it, expect } from 'vitest'
import { formatCompactMoney, formatMoney, formatPercent, isSupportedCurrency } from './currency'

describe('currency utils', () => {
  it('знает только 4 валюты', () => {
    expect(['USD', 'EUR', 'RUB', 'UZS'].every(isSupportedCurrency)).toBe(true)
    expect(isSupportedCurrency('GBP')).toBe(false)
  })

  it('форматирует USD и мелкие значения с точностью', () => {
    expect(formatMoney(64213.5, 'USD')).toBe('$64,213.50')
    expect(formatMoney(0.000123, 'USD')).toBe('$0.000123')
  })

  it('содержит символ/код выбранной валюты', () => {
    expect(formatMoney(10, 'EUR')).toContain('€')
    expect(formatMoney(1000, 'RUB')).toContain('₽')
    expect(formatMoney(1_000_000, 'UZS')).not.toContain('.00')
  })

  it('безопасно обрабатывает пустые значения', () => {
    expect(formatMoney(null)).toBe('—')
    expect(formatMoney(undefined)).toBe('—')
    expect(formatCompactMoney(NaN)).toBe('—')
    expect(formatPercent(null)).toBe('—')
  })

  it('форматирует проценты со знаком', () => {
    expect(formatPercent(2.345, { sign: true })).toBe('+2.35%')
    expect(formatPercent(-1, { sign: true })).toBe('-1.00%')
  })
})
