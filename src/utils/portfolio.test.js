import { describe, it, expect } from 'vitest'
import { computePortfolio, mergeHolding, sanitizeHoldings } from './portfolio'

const holding = (id, amount, buyPriceUsd) => ({ id, name: id, symbol: id, image: '', amount, buyPriceUsd })

describe('mergeHolding', () => {
  it('добавляет новую монету', () => {
    expect(mergeHolding([], holding('btc', 1, 100))).toHaveLength(1)
  })

  it('объединяет одинаковые монеты со средневзвешенной ценой', () => {
    const result = mergeHolding([holding('btc', 1, 100)], holding('btc', 3, 200))
    expect(result).toHaveLength(1)
    expect(result[0].amount).toBe(4)
    expect(result[0].buyPriceUsd).toBe(175) // (1*100 + 3*200) / 4
  })
})

describe('computePortfolio', () => {
  it('считает стоимость, вложения и прибыль', () => {
    const coins = new Map([
      ['btc', { current_price: 150 }],
      ['eth', { current_price: 5 }],
    ])
    const result = computePortfolio([holding('btc', 2, 100), holding('eth', 10, 10)], coins)
    expect(result.totalValue).toBe(350) // 300 + 50
    expect(result.totalCost).toBe(300) // 200 + 100
    expect(result.totalPnl).toBe(50)
    expect(result.totalPnlPercent).toBeCloseTo(16.6667, 3)
    expect(result.rows[1].pnl).toBe(-50)
  })

  it('не включает в итоги монеты без загруженной цены', () => {
    const result = computePortfolio([holding('btc', 1, 100), holding('new', 1, 100)], new Map([['btc', { current_price: 110 }]]))
    expect(result.hasPending).toBe(true)
    expect(result.totalValue).toBe(110)
    expect(result.totalCost).toBe(100)
    expect(result.rows[1].pending).toBe(true)
  })

  it('не делит на ноль при нулевой цене покупки', () => {
    const result = computePortfolio([holding('airdrop', 5, 0)], new Map([['airdrop', { current_price: 2 }]]))
    expect(result.rows[0].pnlPercent).toBeNull()
    expect(result.totalPnlPercent).toBeNull()
  })
})

describe('sanitizeHoldings', () => {
  it('оставляет только корректные позиции', () => {
    const good = holding('btc', 1, 1)
    expect(sanitizeHoldings([good, null, holding('x', 0, 1), holding('y', 1, -5), { id: 1 }])).toEqual([good])
  })
})
