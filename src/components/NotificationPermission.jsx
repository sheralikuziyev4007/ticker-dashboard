import { useState } from 'react'
import {
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
} from '../utils/notify'

/** Статус разрешения на системные уведомления и кнопка запроса (нужен клик пользователя). */
export default function NotificationPermission() {
  const [permission, setPermission] = useState(notificationPermission)

  if (!notificationsSupported()) {
    return (
      <p className="text-xs font-mono text-text-muted mb-4">
        Браузер не поддерживает системные уведомления — сообщения будут показаны на странице.
      </p>
    )
  }

  if (permission === 'granted') {
    return <p className="text-xs font-mono text-up mb-4">● Системные уведомления включены</p>
  }

  if (permission === 'denied') {
    return (
      <p className="text-xs font-mono text-text-muted mb-4">
        Уведомления заблокированы в настройках браузера — сообщения будут показаны на странице.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <p className="text-xs font-mono text-text-muted">
        Разрешите уведомления, чтобы получать оповещения, даже когда вкладка в фоне.
      </p>
      <button
        type="button"
        onClick={async () => setPermission(await requestNotificationPermission())}
        className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono text-text-primary
                   hover:border-gold hover:text-gold transition-colors"
      >
        Включить уведомления
      </button>
    </div>
  )
}
