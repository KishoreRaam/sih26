import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { domains, type DomainId } from '../../data/competencyDomains'

// Used by CompetencyScoreCard (and any other component that needs to decide whether a
// score has enough evidence behind it) so this threshold can only ever be changed in
// one place. Officer dashboard, gap analysis, and the admin heatmap must all import
// this rather than hardcoding their own number.
export const MIN_QUESTIONS_FOR_CONFIDENCE = 5

interface FracDomainColor {
  /** Solid background, for bars/legend dots (e.g. SegmentedBar segments). */
  bg: string
  text: string
  /** Low-opacity background for chips/cards. */
  tint: string
  border: string
}

// Single source of truth for FRAC domain -> color. Every screen that tags something
// with a FRAC domain (badges, heatmaps, segmented bars, score cards) must import this
// map rather than defining its own, or the app's domain colors will drift out of sync.
export const FRAC_DOMAIN_COLORS: Record<DomainId, FracDomainColor> = {
  statistical: { bg: 'bg-primary', text: 'text-primary', tint: 'bg-primary/12', border: 'border-primary/30' },
  technical: { bg: 'bg-secondary', text: 'text-secondary', tint: 'bg-secondary/12', border: 'border-secondary/30' },
  governance: { bg: 'bg-accent', text: 'text-accent', tint: 'bg-accent/12', border: 'border-accent/30' },
  behavioural: {
    bg: 'bg-text-secondary',
    text: 'text-text-secondary',
    tint: 'bg-text-secondary/12',
    border: 'border-text-secondary/30',
  },
}

interface FracTagBadgeProps {
  domain: DomainId
  subdomain?: string
  competency?: string
  className?: string
}

export function FracTagBadge({ domain, subdomain, competency, className = '' }: FracTagBadgeProps) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)

  const domainName = domains.find((d) => d.id === domain)?.name ?? domain
  const colors = FRAC_DOMAIN_COLORS[domain]
  const hasDetail = Boolean(subdomain || competency)
  const open = hasDetail && (pinned || hovered)

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => hasDetail && setPinned((p) => !p)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-micro font-medium transition-colors ${colors.tint} ${colors.text} ${colors.border} ${
          hasDetail ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <span className={`size-1.5 shrink-0 rounded-full ${colors.bg}`} />
        {domainName}
        {hasDetail && <CaretDown size={10} weight="bold" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full z-10 mt-1 w-max max-w-[280px] rounded-sm border bg-surface p-2.5 shadow-lg ${colors.border}`}
        >
          <p className={`text-micro font-semibold uppercase tracking-wide ${colors.text}`}>{domainName}</p>
          {subdomain && <p className="mt-1 text-caption text-text-primary">{subdomain}</p>}
          {competency && <p className="mt-0.5 text-caption text-text-secondary">{competency}</p>}
        </div>
      )}
    </span>
  )
}
