// Обёртка над Notification API. Любые сбои (Safari, iframe, запрет) глотаются:
// в приложении есть запасной вариант — toast-уведомления внутри страницы.
export const notificationsSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window

export const notificationPermission = () =>
  notificationsSupported() ? Notification.permission : 'unsupported'

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

export function showNotification(title, body, icon) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return false
  try {
    new Notification(title, { body, icon })
    return true
  } catch {
    return false
  }
}
