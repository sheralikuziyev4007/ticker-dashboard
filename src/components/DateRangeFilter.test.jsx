import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DateRangeFilter from './DateRangeFilter'

const setup = (props = {}) => {
  const onDateRangeChange = vi.fn()
  const onPeriodChange = vi.fn()
  render(
    <DateRangeFilter
      period="7d"
      onPeriodChange={onPeriodChange}
      dateRange={null}
      onDateRangeChange={onDateRangeChange}
      dateError={null}
      {...props}
    />,
  )
  return { onDateRangeChange, onPeriodChange }
}

describe('DateRangeFilter', () => {
  it('сбрасывает значения инпутов кнопкой ✕', () => {
    const { onDateRangeChange } = setup()
    const from = screen.getByLabelText('Дата от')
    const to = screen.getByLabelText('Дата до')

    fireEvent.change(from, { target: { value: '2026-01-01' } })
    fireEvent.change(to, { target: { value: '2026-01-10' } })
    expect(from).toHaveValue('2026-01-01')

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить даты' }))

    expect(from).toHaveValue('')
    expect(to).toHaveValue('')
    expect(onDateRangeChange).toHaveBeenLastCalledWith(null)
  })

  it('дата "до" включает весь выбранный день', () => {
    const { onDateRangeChange } = setup()
    fireEvent.change(screen.getByLabelText('Дата от'), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText('Дата до'), { target: { value: '2026-01-01' } })

    const start = Date.UTC(2026, 0, 1) / 1000
    expect(onDateRangeChange).toHaveBeenLastCalledWith({ from: start, to: start + 86_399 })
  })

  it('не гасит подсветку периода, пока задана только одна дата', () => {
    setup({ dateRange: { from: 1_700_000_000, to: null } })
    expect(screen.getByText('7Д').className).toContain('bg-gold')
  })

  it('гасит подсветку периода, когда активен полный диапазон', () => {
    setup({ dateRange: { from: 1_700_000_000, to: 1_700_100_000 } })
    expect(screen.getByText('7Д').className).not.toContain('bg-gold')
  })
})
