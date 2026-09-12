import { ChartBar, Plus } from '@phosphor-icons/react'
import { getStrongestDimension, getWeakestDimension, mockCompetencyMatrix, session } from '../../mockData'

interface OverviewScreenProps {
  onStart: () => void
  onViewReport: () => void
}

export function OverviewScreen({ onStart, onViewReport }: OverviewScreenProps) {
  const weakest = getWeakestDimension()
  const strongest = getStrongestDimension()

  return (
    <div className="max-w-2xl">
      <p className="text-h1 font-semibold leading-snug text-text-primary">
        Welcome back, {session.name.split(' ')[0]}. Cohort A is strongest in{' '}
        <span className="text-strong">{strongest.label.toLowerCase()}</span> and weakest in{' '}
        <span className="text-weak">{weakest.label.toLowerCase()}</span>.
      </p>
      <p className="mt-2 text-caption text-text-secondary">
        {mockCompetencyMatrix.length} officers assessed in the current cohort.
      </p>

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        <button
          type="button"
          onClick={onViewReport}
          className="flex w-full items-center gap-3 bg-surface p-4 text-left transition-colors hover:bg-surface-alt"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary-tint text-primary">
            <ChartBar size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body font-medium text-text-primary">
              Continue to the full competency report
            </span>
            <span className="block text-caption text-text-muted">
              Review the heatmap and training recommendations for Cohort A.
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onStart}
          className="flex w-full items-center gap-3 bg-surface p-4 text-left transition-colors hover:bg-surface-alt"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-alt text-text-secondary">
            <Plus size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-body font-medium text-text-primary">
              Start a new assessment
            </span>
            <span className="block text-caption text-text-muted">
              Upload reference material to diagnose a different cohort.
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
