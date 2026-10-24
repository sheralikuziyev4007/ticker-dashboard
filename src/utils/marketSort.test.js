import { describe, it, expect } from 'vitest'
import { filterByMovement, filterByQuery, getGainersLosers, sortCoins } from './marketSort'

const coins = [
  { id: 'a', name: 'Alpha', symbol: 'aaa', market_cap: 300, total_volume: 5, price_change_percentage_24h: 1 },
  { id: 'b', name: 'Beta', symbol: 'bbb', market_cap: 100, total_volume: 50, price_change_percentage_24h: -5 },
  { id: 'c', name: 'Gamma', symbol: 'ccc', market_cap: 200, total_volume: 20, price_change_percentage_24h: 9 },
  { id: 'd', name: 'Delta', symbol: 'ddd', market_cap: null, total_volume: null, price_change_percentage_24h: null },
]
const ids = (list) => list.map((c) => c.id)

describe('sortCoins', () => {
  it('default сохраняет исходный порядок и не мутирует массив', () => {
    const result = sortCoins(coins, 'default')
    expect(ids(result)).toEqual(['a', 'b', 'c', 'd'])
    expect(result).not.toBe(coins)
  })

  it('сортирует по капитализации, пустые значения — в конец', () => {
    expect(ids(sortCoins(coins, 'market_cap', 'desc'))).toEqual(['a', 'c', 'b', 'd'])
    expect(ids(sortCoins(coins, 'market_cap', 'asc'))).toEqual(['b', 'c', 'a', 'd'])
  })

  it('сортирует по изменению за 24ч и по объёму', () => {
    expect(ids(sortCoins(coins, 'change', 'desc'))).toEqual(['c', 'a', 'b', 'd'])
    expect(ids(sortCoins(coins, 'volume', 'desc'))).toEqual(['b', 'c', 'a', 'd'])
  })
})

describe('фильтры', () => {
  it('gainers / losers', () => {
    expect(ids(filterByMovement(coins, 'gainers'))).toEqual(['a', 'c'])
    expect(ids(filterByMovement(coins, 'losers'))).toEqual(['b'])
    expect(filterByMovement(coins, 'all')).toBe(coins)
  })

  it('поиск по имени и тикеру', () => {
    expect(ids(filterByQuery(coins, 'gam'))).toEqual(['c'])
    expect(ids(filterByQuery(coins, 'BBB'))).toEqual(['b'])
    expect(filterByQuery(coins, '  ')).toBe(coins)
  })

  it('getGainersLosers возвращает лидеров и учитывает лимит', () => {
    const { gainers, losers } = getGainersLosers(coins, 1)
    expect(ids(gainers)).toEqual(['c'])
    expect(ids(losers)).toEqual(['b'])
  })
})
