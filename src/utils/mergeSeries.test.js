import { describe, it, expect } from 'vitest'
import { mergeSeries } from './mergeSeries'

const mk = (id, prices, start = 0, step = 1000) => ({
  id,
  points: prices.map((price, i) => ({ timestamp: start + i * step, price })),
})

describe('mergeSeries', () => {
  it('возвращает пустой массив без данных', () => {
    expect(mergeSeries([])).toEqual([])
    expect(mergeSeries([{ id: 'a', points: [] }])).toEqual([])
  })

  it('объединяет два ряда в строки с ключами по id монет', () => {
    const rows = mergeSeries([mk('btc', [10, 20, 30]), mk('eth', [1, 2, 3])], 'price')
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ timestamp: 0, btc: 10, eth: 1 })
    expect(rows[2]).toMatchObject({ btc: 30, eth: 3 })
  })

  it('считает % изменения от первой точки в режиме percent', () => {
    const rows = mergeSeries([mk('btc', [100, 150, 50])], 'percent')
    expect(rows.map((r) => r.btc)).toEqual([0, 50, -50])
  })

  it('сопоставляет точки с чуть разными метками времени', () => {
    const a = mk('a', [1, 2, 3], 0, 1000)
    const b = mk('b', [5, 6, 7], 7, 1000) // сдвиг на 7 мс
    const rows = mergeSeries([a, b], 'price')
    expect(rows).toHaveLength(3)
    expect(rows[1]).toMatchObject({ a: 2, b: 6 })
  })

  it('пропускает ряд с нулевой стартовой ценой в режиме percent', () => {
    const rows = mergeSeries([mk('z', [0, 1, 2]), mk('ok', [1, 2, 3])], 'percent')
    expect(rows.every((r) => r.z === undefined)).toBe(true)
    expect(rows[2].ok).toBe(200)
  })
})
