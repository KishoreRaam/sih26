import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { getOfficerAverage, mockCompetencyMatrix } from '../../mockData'

const STRONG_THRESHOLD = 76

export function OfficersScreen() {
  const [ascending, setAscending] = useState(true)

  const sorted = [...mockCompetencyMatrix].sort((a, b) => {
    const diff = getOfficerAverage(a) - getOfficerAverage(b)
    return ascending ? diff : -diff
  })

  const belowStrong = mockCompetencyMatrix.filter(
    (officer) => getOfficerAverage(officer) < STRONG_THRESHOLD,
  ).length

  return (
    <div className="max-w-2xl">
      <p className="text-h1 font-semibold leading-snug text-text-primary">
        {belowStrong} of {mockCompetencyMatrix.length} officers score below the strong threshold
        overall.
      </p>
      <p className="mt-2 text-caption text-text-secondary">
        Ranked by overall competency score across all four dimensions.
      </p>

      <div className="mt-6 overflow-hidden rounded-sm border border-border">
        <div className="grid grid-cols-[1fr_140px] border-b border-border bg-surface-alt">
          <span className="px-4 py-3 text-h3 font-semibold text-text-primary">Officer</span>
          <button
            type="button"
            onClick={() => setAscending((v) => !v)}
            className="flex items-center justify-end gap-1 px-4 py-3 text-right text-h3 font-semibold text-text-primary transition-colors hover:bg-border/50"
          >
            Average score
            {ascending ? <CaretUp size={12} weight="bold" /> : <CaretDown size={12} weight="bold" />}
          </button>
        </div>
        {sorted.map((officer) => (
          <div
            key={officer.id}
            className="grid grid-cols-[1fr_140px] border-b border-border bg-surface px-4 py-3 last:border-b-0"
          >
            <span className="text-body text-text-primary">{officer.name}</span>
            <span className="text-right text-cell font-medium tabular-nums text-text-primary">
              {getOfficerAverage(officer)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
