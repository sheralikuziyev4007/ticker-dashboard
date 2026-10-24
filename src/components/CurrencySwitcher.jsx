import { useCurrency } from '../context/CurrencyContext'
import { CURRENCIES } from '../utils/currency'

/** Переключатель валюты отображения: USD / EUR / RUB / UZS. */
export default function CurrencySwitcher() {
  const { currency, setCurrency, ratesStatus } = useCurrency()

  return (
    <div
      role="group"
      aria-label="Валюта отображения"
      className="flex rounded-lg border border-border bg-surface p-0.5"
      title={
        ratesStatus === 'fallback'
          ? 'Курсы валют не загрузились — используются приблизительные значения'
          : undefined
      }
    >
      {CURRENCIES.map((c) => (
        <button
          key={c.code}
          type="button"
          onClick={() => setCurrency(c.code)}
          aria-pressed={currency === c.code}
          className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
            currency === c.code
              ? 'bg-gold text-ink'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {c.label}
        </button>
      ))}
      {currency !== 'USD' && ratesStatus === 'fallback' && (
        <span className="self-center pl-1.5 pr-1 font-mono text-[10px] text-text-faint" aria-hidden="true">
          ≈
        </span>
      )}
    </div>
  )
}
