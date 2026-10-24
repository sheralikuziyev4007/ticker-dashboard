import { describe, it, expect } from 'vitest'
import { isAlertTriggered, sanitizeAlerts } from './alerts'

describe('isAlertTriggered', () => {
  it('above срабатывает при цене >= порога', () => {
    const alert = { direction: 'above', targetUsd: 100 }
    expect(isAlertTriggered(alert, 99.99)).toBe(false)
    expect(isAlertTriggered(alert, 100)).toBe(true)
    expect(isAlertTriggered(alert, 150)).toBe(true)
  })

  it('below срабатывает при цене <= порога', () => {
    const alert = { direction: 'below', targetUsd: 100 }
    expect(isAlertTriggered(alert, 100.01)).toBe(false)
    expect(isAlertTriggered(alert, 100)).toBe(true)
    expect(isAlertTriggered(alert, 1)).toBe(true)
  })

  it('не срабатывает без валидной цены', () => {
    expect(isAlertTriggered({ direction: 'above', targetUsd: 1 }, undefined)).toBe(false)
    expect(isAlertTriggered({ direction: 'above', targetUsd: 1 }, NaN)).toBe(false)
  })
})

describe('sanitizeAlerts', () => {
  it('отбрасывает испорченные записи', () => {
    const good = { id: '1', coinId: 'bitcoin', targetUsd: 5, direction: 'above' }
    const result = sanitizeAlerts([good, null, { id: '2' }, { ...good, direction: 'sideways' }])
    expect(result).toEqual([good])
    expect(sanitizeAlerts('oops')).toEqual([])
  })
})
