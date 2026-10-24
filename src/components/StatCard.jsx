/** Универсальная карточка метрики: подпись, крупное значение, подпись снизу. */
export default function StatCard({ label, value, hint, hintTone, status = 'success', children }) {
  const toneClass =
    hintTone === 'up' ? 'text-up' : hintTone === 'down' ? 'text-down' : 'text-text-muted'

  return (
    <div className="rounded-xl border border-border bg-surface p-4 min-w-0">
      <p className="font-mono text-[11px] uppercase tracking-wide text-text-faint mb-2">{label}</p>

      {status === 'loading' ? (
        <div className="space-y-2 animate-pulse" aria-hidden="true">
          <div className="h-6 w-28 rounded bg-surface2" />
          <div className="h-3 w-16 rounded bg-surface2" />
        </div>
      ) : status === 'error' ? (
        <p className="font-mono text-sm text-text-faint">нет данных</p>
      ) : (
        <>
          <p className="font-mono text-xl text-text-primary tabular-nums truncate">{value}</p>
          {hint && <p className={`font-mono text-xs mt-1 ${toneClass}`}>{hint}</p>}
          {children}
        </>
      )}
    </div>
  )
}
