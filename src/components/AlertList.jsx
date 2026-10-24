import { useCurrency } from '../context/CurrencyContext'
import { DIRECTION_LABEL } from '../utils/alerts'

/** Список алертов: активные и сработавшие, с удалением и повторным включением. */
export default function AlertList({ alerts, onRemove, onRearm }) {
  const { formatPrice } = useCurrency()

  if (alerts.length === 0) {
    return (
      <div className="text-center py-14 text-text-muted">
        <p className="font-display text-text-primary mb-1">Алертов пока нет</p>
        <p className="text-sm">Создайте первый — уведомим, когда цена достигнет нужного уровня.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {alerts.map((alert) => {
        const done = Boolean(alert.triggeredAt)
        return (
          <li
            key={alert.id}
            className={`flex flex-wrap items-center gap-3 rounded-xl border bg-surface px-4 py-3 ${
              done ? 'border-up/30' : 'border-border'
            }`}
          >
            <img src={alert.image} alt="" className="w-6 h-6 rounded-full shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text-primary truncate">
                {alert.name} <span className="text-text-faint uppercase font-mono text-xs">{alert.symbol}</span>
              </p>
              <p className="font-mono text-xs text-text-muted">
                цена {DIRECTION_LABEL[alert.direction]} {formatPrice(alert.targetUsd)}
              </p>
            </div>

            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                done ? 'text-up bg-up/10' : 'text-gold bg-gold/10'
              }`}
            >
              {done
                ? `сработал ${new Date(alert.triggeredAt).toLocaleString('ru-RU')}`
                : 'ожидает'}
            </span>

            {done && (
              <button
                type="button"
                onClick={() => onRearm(alert.id)}
                className="font-mono text-xs text-text-muted hover:text-gold transition-colors"
              >
                Включить снова
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(alert.id)}
              aria-label={`Удалить алерт ${alert.name}`}
              className="text-text-faint hover:text-down transition-colors px-1"
            >
              ✕
            </button>
          </li>
        )
      })}
    </ul>
  )
}
