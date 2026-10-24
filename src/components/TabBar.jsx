/** Переключатель разделов. Доступность: role=tablist/tab + aria-selected. */
export default function TabBar({ tabs, active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Разделы"
      className="flex gap-1 overflow-x-auto border-b border-border mb-6"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          id={`tab-${tab.key}`}
          aria-selected={active === tab.key}
          aria-controls={`panel-${tab.key}`}
          onClick={() => onChange(tab.key)}
          className={`shrink-0 px-4 py-2.5 font-display text-sm border-b-2 -mb-px transition-colors ${
            active === tab.key
              ? 'border-gold text-text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {tab.label}
          {tab.badge > 0 && (
            <span className="ml-1.5 rounded-full bg-gold/20 text-gold px-1.5 py-0.5 font-mono text-[10px]">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
