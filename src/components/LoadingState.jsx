export default function LoadingState({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-surface p-4 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-surface2" />
            <div className="h-3 w-16 bg-surface2 rounded" />
          </div>
          <div className="h-6 w-24 bg-surface2 rounded mb-2" />
          <div className="h-3 w-12 bg-surface2 rounded" />
        </div>
      ))}
    </div>
  )
}
