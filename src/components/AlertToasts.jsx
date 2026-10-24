import { useEffect } from 'react'

const AUTO_CLOSE_MS = 12_000

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-gold-dim bg-surface2 px-4 py-3 shadow-2xl max-w-sm"
    >
      <img src={toast.image} alt="" className="w-6 h-6 rounded-full mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm text-text-primary">{toast.title}</p>
        <p className="font-mono text-xs text-text-muted mt-0.5">{toast.body}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Закрыть уведомление"
        className="text-text-faint hover:text-text-primary text-sm"
      >
        ✕
      </button>
    </div>
  )
}

/** Уведомления внутри страницы — запасной вариант, если системные Notification недоступны. */
export default function AlertToasts({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
