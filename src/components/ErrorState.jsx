export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-down/30 bg-down/5 py-14 px-6 text-center">
      <div className="w-10 h-10 rounded-full border border-down/40 flex items-center justify-center text-down font-display text-lg">
        !
      </div>
      <div>
        <p className="font-display text-text-primary text-base mb-1">
          Данные не загрузились
        </p>
        <p className="text-text-muted text-sm max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-gold text-ink font-medium text-sm hover:bg-gold-bright transition-colors"
      >
        Повторить
      </button>
    </div>
  )
}
