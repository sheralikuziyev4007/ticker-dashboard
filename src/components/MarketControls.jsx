import { SORT_OPTIONS } from '../utils/marketSort'

const MOVEMENTS = [
  { key: 'all', label: 'Все' },
  { key: 'gainers', label: 'Растут' },
  { key: 'losers', label: 'Падают' },
]

/** Панель сортировки и фильтра: ключ сортировки, направление, рост/падение. */
export default function MarketControls({
  sortKey,
  direction,
  movement,
  onSortKeyChange,
  onDirectionChange,
  onMovementChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <label className="flex items-center gap-2 font-mono text-[11px] text-text-faint uppercase">
        Сортировка
        <select
          value={sortKey}
          onChange={(e) => onSortKeyChange(e.target.value)}
          className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs normal-case text-text-primary"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => onDirectionChange(direction === 'desc' ? 'asc' : 'desc')}
        disabled={sortKey === 'default'}
        aria-label={direction === 'desc' ? 'По убыванию' : 'По возрастанию'}
        title={direction === 'desc' ? 'По убыванию' : 'По возрастанию'}
        className="px-2.5 py-1.5 rounded-lg border border-border font-mono text-xs text-text-muted
                   hover:text-gold hover:border-gold-dim transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {direction === 'desc' ? '↓' : '↑'}
      </button>

      <div className="flex rounded-lg border border-border bg-surface p-0.5 ml-auto sm:ml-2">
        {MOVEMENTS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onMovementChange(m.key)}
            aria-pressed={movement === m.key}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
              movement === m.key ? 'bg-gold text-ink' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
