import { WarningCircle } from '@phosphor-icons/react'
import type { DomainId } from '../../data/competencyDomains'
import { FRAC_DOMAIN_COLORS, FracTagBadge, MIN_QUESTIONS_FOR_CONFIDENCE } from './FracTagBadge'

export type CompetencyScoreStatus = 'strong' | 'moderate' | 'weak'

const statusMeta: Record<CompetencyScoreStatus, { label: string; text: string; tint: string }> = {
  strong: { label: 'Strong', text: 'text-strong', tint: 'bg-strong-tint' },
  moderate: { label: 'Moderate', text: 'text-moderate', tint: 'bg-moderate-tint' },
  weak: { label: 'Weak', text: 'text-weak', tint: 'bg-weak-tint' },
}

interface CompetencyScoreCardProps {
  domain: DomainId
  score: number
  sampleSize: number
  confidenceBandLower: number
  confidenceBandUpper: number
  status: CompetencyScoreStatus
}

export function CompetencyScoreCard({
  domain,
  score,
  sampleSize,
  confidenceBandLower,
  confidenceBandUpper,
  status,
}: CompetencyScoreCardProps) {
  if (sampleSize < MIN_QUESTIONS_FOR_CONFIDENCE) {
    const remaining = MIN_QUESTIONS_FOR_CONFIDENCE - sampleSize
    return (
      <div
        className="rounded-sm border-2 border-dashed border-insufficient bg-surface p-4"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-insufficient) 12%, transparent) 0px, color-mix(in srgb, var(--color-insufficient) 12%, transparent) 1.5px, transparent 1.5px, transparent 10px)',
        }}
      >
        <FracTagBadge domain={domain} />
        <div className="mt-3 flex items-start gap-2">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-insufficient" />
          <div>
            <p className="text-body font-semibold text-insufficient">Insufficient evidence</p>
            <p className="mt-0.5 text-caption text-text-secondary">
              Needs {remaining} more question{remaining === 1 ? '' : 's'} before a confidence score can be shown.
            </p>
            <p className="mt-1.5 text-micro tabular-nums text-text-muted">
              {sampleSize} of {MIN_QUESTIONS_FOR_CONFIDENCE} minimum questions answered
            </p>
          </div>
        </div>
      </div>
    )
  }

  const colors = FRAC_DOMAIN_COLORS[domain]
  const meta = statusMeta[status]
  const lower = Math.max(0, Math.min(100, confidenceBandLower))
  const upper = Math.max(0, Math.min(100, confidenceBandUpper))
  const bandWidth = Math.max(0, upper - lower)

  return (
    <div className="card-lift rounded-sm border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <FracTagBadge domain={domain} />
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${meta.tint} ${meta.text}`}>
          {meta.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-metric font-semibold tabular-nums text-text-primary">{score}%</span>
        <span className="text-caption tabular-nums text-text-muted">
          ({lower}%–{upper}%)
        </span>
      </div>

      <div className="relative mt-3 h-2 rounded-sm bg-surface-alt">
        <div
          className={`absolute inset-y-0 rounded-sm ${colors.tint}`}
          style={{ left: `${lower}%`, width: `${bandWidth}%` }}
          title={`Confidence band: ${lower}%–${upper}%`}
        />
        <div
          className={`absolute inset-y-0 w-0.5 rounded-sm ${colors.bg}`}
          style={{ left: `${Math.max(0, Math.min(100, score))}%` }}
          title={`Point estimate: ${score}%`}
        />
      </div>

      <p className="mt-1.5 text-micro text-text-muted">
        {sampleSize} question{sampleSize === 1 ? '' : 's'} · shown as a range, not a single-point guess
      </p>
    </div>
  )
}
