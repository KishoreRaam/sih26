import { TrendDown, TrendUp } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

interface StatCardProps {
  label: string
  value: string
  previousLabel: string
  deltaLabel: string
  trend: 'up' | 'down'
  icon?: Icon
}

export function StatCard({ label, value, previousLabel, deltaLabel, trend, icon: ItemIcon }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendUp : TrendDown
  const trendToneClass = trend === 'up' ? 'text-strong' : 'text-weak'

  return (
    <div className="card-lift rounded-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-caption text-text-secondary">{label}</p>
        {ItemIcon && <ItemIcon size={16} className="text-text-muted" />}
      </div>
      <p className="mt-2 text-metric font-semibold tabular-nums text-text-primary">{value}</p>
      <p className="mt-1 text-caption text-text-muted">{previousLabel}</p>
      <p className={`mt-1 flex items-center gap-1 text-caption font-medium ${trendToneClass}`}>
        <TrendIcon size={13} weight="bold" />
        {deltaLabel}
      </p>
    </div>
  )
}
