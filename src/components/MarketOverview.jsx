import { useFearGreed } from '../hooks/useFearGreed'
import { useGlobalStats } from '../hooks/useGlobalStats'
import FearGreedCard from './FearGreedCard'
import GlobalStatsCards from './GlobalStatsCards'

/** Верхняя полоса с общими показателями рынка. Не блокирует остальной интерфейс при ошибке. */
export default function MarketOverview() {
  const { stats, status: statsStatus } = useGlobalStats()
  const { index, status: fngStatus } = useFearGreed()

  return (
    <section aria-label="Обзор рынка" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <GlobalStatsCards stats={stats} status={statsStatus} />
      <FearGreedCard index={index} status={fngStatus} />
    </section>
  )
}
