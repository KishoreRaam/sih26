import { useEffect, useState } from 'react'
import { CaretDown, CaretUp, WarningCircle } from '@phosphor-icons/react'
import { mockGeneration } from '../../mockData'

type GenState = 'running' | 'done'
type Tone = 'neutral' | 'strong' | 'weak'

interface GenerateScreenProps {
  onComplete: () => void
}

function StatTile({ label, value, tone }: { label: string; value: number; tone: Tone }) {
  const toneClass =
    tone === 'strong' ? 'text-strong' : tone === 'weak' ? 'text-weak' : 'text-text-primary'
  return (
    <div className="rounded-sm border border-border bg-surface p-4">
      <p className={`text-metric font-medium tabular-nums ${toneClass}`}>{value}</p>
      <p className="mt-1 text-caption text-text-secondary">{label}</p>
    </div>
  )
}

export function GenerateScreen({ onComplete }: GenerateScreenProps) {
  const [state, setState] = useState<GenState>('running')
  const [counts, setCounts] = useState({ generated: 0, verified: 0, rejected: 0 })
  const [showRejected, setShowRejected] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const fraction = Math.min((Date.now() - start) / mockGeneration.durationMs, 1)
      setCounts({
        generated: Math.round(mockGeneration.generated * fraction),
        verified: Math.round(mockGeneration.verified * fraction),
        rejected: Math.round(mockGeneration.rejected * fraction),
      })
      if (fraction >= 1) {
        clearInterval(id)
        setState('done')
      }
    }, 60)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-3 gap-4">
        <StatTile label="Generated" value={counts.generated} tone="neutral" />
        <StatTile label="Verified" value={counts.verified} tone="strong" />
        <StatTile label="Rejected" value={counts.rejected} tone="weak" />
      </div>

      {state === 'running' && (
        <p className="mt-4 text-caption text-text-muted">
          Drafting and verifying questions against the source material.
        </p>
      )}

      {state === 'done' && (
        <>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowRejected((v) => !v)}
              className="flex items-center gap-1.5 text-body font-medium text-primary hover:text-primary-hover"
            >
              {showRejected ? <CaretUp size={16} /> : <CaretDown size={16} />}
              View rejected
            </button>

            {showRejected && (
              <div className="mt-3 space-y-2">
                {mockGeneration.rejectedSample.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-sm bg-weak-tint px-3 py-2"
                  >
                    <WarningCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-weak" />
                    <p className="text-caption text-weak">{item.reason}</p>
                  </div>
                ))}
                <p className="text-caption text-text-muted">
                  Showing {mockGeneration.rejectedSample.length} of {mockGeneration.rejected}{' '}
                  rejected items.
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="mt-6 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Continue to assessment
          </button>
        </>
      )}
    </div>
  )
}
