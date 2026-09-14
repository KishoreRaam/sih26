import { Fragment, useMemo, useState } from 'react'
import { CaretRight, CaretUp } from '@phosphor-icons/react'
import {
  competencyDimensions,
  getOfficerAverage,
  getOfficersAtLevel,
  getStrongestDimension,
  getWeakestDimension,
  mockCompetencyMatrix,
  type CompetencyLevel,
  type OfficerRow,
} from '../../mockData'

interface DashboardScreenProps {
  onComplete: () => void
}

const levelLabel: Record<CompetencyLevel, string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
  insufficient: 'Insufficient data',
}

const levelCellClasses: Record<CompetencyLevel, string> = {
  strong: 'border-strong/25 bg-strong-tint text-strong',
  moderate: 'border-moderate/25 bg-moderate-tint text-moderate',
  weak: 'border-weak/25 bg-weak-tint text-weak',
  insufficient: 'border-dashed border-insufficient bg-surface',
}

function officerExtremes(officer: OfficerRow) {
  const scored = competencyDimensions
    .map((dimension) => ({ dimension, cell: officer.cells[dimension.id] }))
    .filter(
      (entry): entry is { dimension: (typeof competencyDimensions)[number]; cell: { score: number; level: CompetencyLevel } } =>
        entry.cell.score !== null,
    )
  const weakest = scored.reduce((min, entry) => (entry.cell.score < min.cell.score ? entry : min), scored[0])
  const strongest = scored.reduce((max, entry) => (entry.cell.score > max.cell.score ? entry : max), scored[0])
  return { weakest, strongest }
}

export function DashboardScreen({ onComplete }: DashboardScreenProps) {
  const [sortKey, setSortKey] = useState<string>('overall')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allCells = mockCompetencyMatrix.flatMap((officer) =>
    competencyDimensions.map((dim) => officer.cells[dim.id]),
  )
  const validScores = allCells
    .map((cell) => cell.score)
    .filter((score): score is number => score !== null)
  const averageScore = Math.round(
    validScores.reduce((sum, score) => sum + score, 0) / validScores.length,
  )
  const insufficientCount = allCells.filter((cell) => cell.level === 'insufficient').length
  const weakest = getWeakestDimension()
  const strongest = getStrongestDimension()
  const needsSupportCount =
    getOfficersAtLevel(weakest.id, 'weak').length + getOfficersAtLevel(weakest.id, 'moderate').length

  const sortedOfficers = useMemo(() => {
    const rows = [...mockCompetencyMatrix]
    if (sortKey === 'overall') {
      rows.sort((a, b) => getOfficerAverage(a) - getOfficerAverage(b))
    } else {
      rows.sort((a, b) => {
        const scoreA = a.cells[sortKey].score ?? Infinity
        const scoreB = b.cells[sortKey].score ?? Infinity
        return scoreA - scoreB
      })
    }
    return rows
  }, [sortKey])

  const activeDimensionLabel = competencyDimensions.find((d) => d.id === sortKey)?.label

  return (
    <div>
      <p className="max-w-[68ch] text-h1 font-semibold leading-snug text-text-primary">
        This cohort is strongest in{' '}
        <span className="text-strong">{strongest.label.toLowerCase()}</span> and weakest in{' '}
        <span className="text-weak">{weakest.label.toLowerCase()}</span>, where{' '}
        <span className="tabular-nums">
          {needsSupportCount} of {mockCompetencyMatrix.length}
        </span>{' '}
        officers need support.
      </p>

      <p className="mt-2 text-caption text-text-secondary">
        {mockCompetencyMatrix.length} officers assessed · {averageScore}% cohort average ·{' '}
        {insufficientCount} cell{insufficientCount === 1 ? '' : 's'} with insufficient data
      </p>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-caption text-text-muted">
          Sorted by {sortKey === 'overall' ? 'overall score' : activeDimensionLabel}, weakest
          officer first. Click a column to sort by that dimension instead.
        </p>
        {sortKey !== 'overall' && (
          <button
            type="button"
            onClick={() => setSortKey('overall')}
            className="shrink-0 text-caption font-medium text-primary hover:text-primary-hover"
          >
            Reset sort
          </button>
        )}
      </div>

      <div className="mt-2 overflow-x-auto rounded-sm border border-border">
        <div
          className="grid min-w-[880px]"
          style={{ gridTemplateColumns: `220px repeat(${competencyDimensions.length}, 1fr)` }}
        >
          <div className="border-b border-border bg-surface-alt px-4 py-3" />
          {competencyDimensions.map((dimension) => {
            const active = sortKey === dimension.id
            return (
              <button
                key={dimension.id}
                type="button"
                onClick={() => setSortKey(dimension.id)}
                className={`flex items-center justify-between gap-1 border-b border-l border-border px-3 py-3 text-left text-h3 font-semibold uppercase tracking-wide transition-colors ${
                  active
                    ? 'bg-primary-tint text-primary'
                    : 'bg-surface-alt text-text-primary hover:bg-border/50'
                }`}
              >
                {dimension.label}
                {active && <CaretUp size={12} weight="bold" />}
              </button>
            )
          })}

          {sortedOfficers.map((officer) => {
            const isExpanded = expandedId === officer.id
            const { weakest: officerWeakest, strongest: officerStrongest } = officerExtremes(officer)

            return (
              <Fragment key={officer.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : officer.id)}
                  className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 text-left text-body font-medium text-text-primary transition-colors hover:bg-surface-alt"
                >
                  <CaretRight
                    size={12}
                    className={`shrink-0 text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  />
                  {officer.name}
                </button>
                {competencyDimensions.map((dimension) => {
                  const cell = officer.cells[dimension.id]
                  return (
                    <div
                      key={dimension.id}
                      className={`flex items-center justify-center border-b border-l px-3 py-3 ${levelCellClasses[cell.level]}`}
                    >
                      {cell.level === 'insufficient' ? (
                        <span className="rounded-full bg-insufficient-tint px-2 py-0.5 text-micro font-medium text-insufficient">
                          Insufficient data
                        </span>
                      ) : (
                        <span className="text-h2 font-semibold tabular-nums">{cell.score}%</span>
                      )}
                    </div>
                  )
                })}
                {isExpanded && (
                  <div className="col-span-full border-b border-border bg-surface-alt px-4 py-3 text-caption text-text-secondary">
                    Strongest in {officerStrongest.dimension.label.toLowerCase()} (
                    {officerStrongest.cell.score}%), weakest in{' '}
                    {officerWeakest.dimension.label.toLowerCase()} ({officerWeakest.cell.score}%).
                  </div>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border border-border bg-surface-alt px-4 py-3">
        {(['strong', 'moderate', 'weak'] as const).map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span
              className={`size-3 rounded-sm ${
                level === 'strong' ? 'bg-strong' : level === 'moderate' ? 'bg-moderate' : 'bg-weak'
              }`}
            />
            <span className="text-caption text-text-secondary">{levelLabel[level]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-sm border border-dashed border-insufficient bg-surface" />
          <span className="text-caption text-text-secondary">Insufficient data</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="mt-6 rounded-sm bg-primary px-4 py-2 text-body font-medium text-white transition-colors hover:bg-primary-hover"
      >
        View recommendations
      </button>
    </div>
  )
}
