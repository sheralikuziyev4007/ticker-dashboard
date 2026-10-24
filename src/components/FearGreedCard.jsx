import StatCard from './StatCard'

// Цвет по зонам индекса: страх -> красный, жадность -> зелёный.
function toneFor(value) {
  if (value < 45) return 'text-down'
  if (value <= 55) return 'text-gold'
  return 'text-up'
}

/** Индекс страха и жадности: число, словесная оценка и шкала с маркером. */
export default function FearGreedCard({ index, status }) {
  const delta = index && index.previous !== null ? index.value - index.previous : null

  return (
    <StatCard
      label="Страх и жадность"
      status={status}
      value={
        index ? (
          <span className="inline-flex items-baseline gap-2">
            <span className={toneFor(index.value)}>{index.value}</span>
            <span className="text-sm text-text-muted">{index.label}</span>
          </span>
        ) : (
          '—'
        )
      }
      hint={delta === null ? null : `${delta > 0 ? '+' : ''}${delta} к вчера`}
      hintTone={delta === null ? undefined : delta >= 0 ? 'up' : 'down'}
    >
      {index && (
        <div className="relative mt-3" role="img" aria-label={`Индекс ${index.value} из 100`}>
          <div
            className="h-1.5 rounded-full"
            style={{ background: 'linear-gradient(to right, #FF5C5C, #D4A24E, #3DDC84)' }}
          />
          <div
            className="absolute -top-0.5 w-0.5 h-2.5 bg-text-primary rounded"
            style={{ left: `${Math.min(100, Math.max(0, index.value))}%` }}
          />
        </div>
      )}
    </StatCard>
  )
}
