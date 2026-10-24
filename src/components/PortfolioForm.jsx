import { useEffect, useState } from 'react'
import CoinPicker from './CoinPicker'
import { useCurrency } from '../context/CurrencyContext'
import { request } from '../utils/api'

const inputClass =
  'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-faint focus-visible:outline-gold'

// Принимает «1,5» и «1.5»; всё остальное — NaN.
const parseNumber = (value) => Number(String(value).trim().replace(',', '.'))

/** Форма добавления позиции: монета, количество, цена покупки (в выбранной валюте). */
export default function PortfolioForm({ onAdd }) {
  const { currency, convert, toUsd } = useCurrency()
  const [coin, setCoin] = useState(null)
  const [amount, setAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [error, setError] = useState(null)

  // После выбора монеты подставляем текущую цену как удобное значение по умолчанию.
  useEffect(() => {
    if (!coin) return undefined
    const controller = new AbortController()
    request(`/simple/price?ids=${coin.id}&vs_currencies=usd`, { signal: controller.signal })
      .then((data) => {
        const usd = data?.[coin.id]?.usd
        if (typeof usd === 'number') setBuyPrice(String(Number(convert(usd).toPrecision(8))))
      })
      .catch(() => {})
    return () => controller.abort()
    // Цена подставляется один раз при выборе монеты, а не при каждой смене валюты.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin])

  const handleSubmit = (e) => {
    e.preventDefault()
    const amountNum = parseNumber(amount)
    const priceNum = parseNumber(buyPrice)

    if (!coin) return setError('Выберите монету через поиск.')
    if (!Number.isFinite(amountNum) || amountNum <= 0) return setError('Количество должно быть больше нуля.')
    if (!Number.isFinite(priceNum) || priceNum < 0) return setError('Укажите цену покупки (число не меньше нуля).')

    onAdd({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image: coin.image,
      amount: amountNum,
      buyPriceUsd: toUsd(priceNum),
    })
    setCoin(null)
    setAmount('')
    setBuyPrice('')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-surface p-4 mb-6" noValidate>
      <h3 className="font-display text-sm text-text-primary mb-3">Добавить в портфель</h3>

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
            <CoinPicker onSelect={setCoin} label="Монета для портфеля" />
          )}
        </div>

        <label className="block">
          <span className="block font-mono text-[11px] uppercase text-text-faint mb-1">Количество</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.5"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="block font-mono text-[11px] uppercase text-text-faint mb-1">
            Цена покупки, {currency}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="за 1 монету"
            className={inputClass}
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
          Добавить
        </button>
      </div>
    </form>
  )
}
