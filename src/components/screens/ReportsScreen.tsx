import { FileText } from '@phosphor-icons/react'
import { getStrongestDimension, getWeakestDimension, mockCompetencyMatrix } from '../../mockData'

interface ReportsScreenProps {
  onViewReport: () => void
}

export function ReportsScreen({ onViewReport }: ReportsScreenProps) {
  const weakest = getWeakestDimension()
  const strongest = getStrongestDimension()

  return (
    <div className="card-lift max-w-2xl rounded-sm border border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary-tint text-primary">
          <FileText size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-caption text-text-muted">
            Generated today · {mockCompetencyMatrix.length} officers assessed
          </p>
          <h2 className="mt-1 text-h2 font-semibold text-text-primary">
            Cohort A: AI competency report
          </h2>
          <p className="mt-2 text-body text-text-secondary">
            Strongest in <span className="text-strong">{strongest.label.toLowerCase()}</span>,
            weakest in <span className="text-weak">{weakest.label.toLowerCase()}</span>.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onViewReport}
        className="mt-4 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
      >
        View report
      </button>
    </div>
  )
}
