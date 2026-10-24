import AlertForm from './AlertForm'
import AlertList from './AlertList'
import NotificationPermission from './NotificationPermission'

/** Раздел «Алерты». Сама проверка цен идёт в фоне (useAlertWatcher в App), даже на других вкладках. */
export default function PriceAlerts({ alerts, onAdd, onRemove, onRearm }) {
  return (
    <>
      <div className="mb-4">
        <h2 className="font-display text-lg text-text-primary">Ценовые алерты</h2>
        <p className="text-text-muted text-xs mt-0.5 font-mono">
          проверка раз в минуту, пока открыта страница
        </p>
      </div>

      <NotificationPermission />
      <AlertForm onAdd={onAdd} />
      <AlertList alerts={alerts} onRemove={onRemove} onRearm={onRearm} />
    </>
  )
}
