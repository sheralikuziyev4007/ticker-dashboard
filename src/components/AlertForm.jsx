import { useState } from 'react'
import CoinPicker from './CoinPicker'
import { useCurrency } from '../context/CurrencyContext'

const parseNumber = (value) => Number(String(value).trim().replace(',', '.'))

/** Форма создания алерта: монета, направление, целевая цена (в выбранной валюте). */
export default function AlertForm({ onAdd }) {
  const { currency, toUsd } = useCurrency()
  const [coin, setCoin] = useState(null)
  const [direction, setDirection] = useState('above')
  const [target, setTarget] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const targetNum = parseNumber(target)

    if (!coin) return setError('Выберите монету через поиск.')
    if (!Number.isFinite(targetNum) || targetNum <= 0) return setError('Целевая цена должна быть больше нуля.')

    onAdd({
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      direction,
      targetUsd: toUsd(targetNum),
    })
    setCoin(null)
    setTarget('')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-4 mb-6" noValidate>
      <h3 className="font-display text-sm text-text-primary mb-3">Новый алерт</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <span className="block font-mono text-[11px] uppercase text-text-faint mb-1">Монета</span>
          {coin ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-gold-dim bg-surface2 px-3 py-2">
              <span className="flex items-center gap-2 min-w-0">
                <img src={coin.image} alt="" className="w-5 h-5 rounded-full shrink-0" />
                <span className="truncate text-sm text-text-primary">{coin.name}</span>
                <span className="text-xs text-text-faint uppercase font-mono">{coin.symbol}</span>
              </span>
              <button
                type="button"
                onClick={() => setCoin(null)}
                aria-label="Сменить монету"
                className="text-text-faint hover:text-text-primary text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <CoinPicker onSelect={setCoin} label="Монета для алерта" />
          )}
        </div>

        <label className="block">
          <span className="block font-mono text-[11px] uppercase text-text-faint mb-1">Условие</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            <option value="above">Цена выше или равна</option>
            <option value="below">Цена ниже или равна</option>
          </select>
        </label>

        <label className="block">
          <span className="block font-mono text-[11px] uppercase text-text-faint mb-1">
            Целевая цена, {currency}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="70000"
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary
                       placeholder:text-text-faint focus-visible:outline-gold"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 mt-3">
        <p role="alert" className="text-down text-xs font-mono min-h-[1rem]">
          {error}
        </p>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-gold text-ink font-medium text-sm hover:bg-gold-bright transition-colors"
        >
          Создать алерт
        </button>
      </div>
      <p className="text-text-faint text-[11px] font-mono mt-2">
        Если условие уже выполнено, алерт сработает при ближайшей проверке (раз в минуту).
      </p>
    </form>
  )
}
