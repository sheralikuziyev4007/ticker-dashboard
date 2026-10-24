import { useEffect, useRef } from 'react'
import { request } from '../utils/api'
import { isAlertTriggered } from '../utils/alerts'

const CHECK_INTERVAL = 60_000

/**
 * Фоновая проверка алертов. Работает на любой вкладке приложения (монтируется в App),
 * пока страница открыта. Запросов нет, если активных алертов нет.
 */
export function useAlertWatcher(alerts, onTrigger) {
  const alertsRef = useRef(alerts)
  const onTriggerRef = useRef(onTrigger)
  alertsRef.current = alerts
  onTriggerRef.current = onTrigger

  const activeIds = [...new Set(alerts.filter((a) => !a.triggeredAt).map((a) => a.coinId))]
    .sort()
    .join(',')

  useEffect(() => {
    if (!activeIds) return undefined

    const controller = new AbortController()

    const check = async () => {
      try {
        const prices = await request(
          `/simple/price?ids=${activeIds}&vs_currencies=usd`,
          { signal: controller.signal },
        )
        for (const alert of alertsRef.current) {
          if (alert.triggeredAt) continue
          const price = prices?.[alert.coinId]?.usd
          if (isAlertTriggered(alert, price)) onTriggerRef.current(alert, price)
        }
      } catch {
        // Сбой сети/лимит — просто попробуем на следующем тике.
      }
    }

    check()
    const interval = setInterval(check, CHECK_INTERVAL)
    return () => {
      clearInterval(interval)
      controller.abort()
    }
  }, [activeIds])
}
