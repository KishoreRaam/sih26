import { useState } from 'react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import {
  getDimensionAverage,
  getOfficersAtLevel,
  getOverallAverage,
  getWeakestDimension,
  mockCompetencyMatrix,
  mockCourseCatalog,
} from '../../mockData'

interface RecommendationsScreenProps {
  onRestart: () => void
}

export function RecommendationsScreen({ onRestart }: RecommendationsScreenProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  const weakest = getWeakestDimension()
  const weakestAverage = getDimensionAverage(weakest.id)
  const overallAverage = getOverallAverage()
  const weakOfficers = getOfficersAtLevel(weakest.id, 'weak')
  const moderateOfficers = getOfficersAtLevel(weakest.id, 'moderate')

  const reasons = [
    `${weakest.label} is the cohort's weakest dimension, averaging ${weakestAverage}% against a ${overallAverage}% overall average.`,
    `${weakOfficers.length} of ${mockCompetencyMatrix.length} officers scored weak here, the largest gap of any dimension.`,
    `${moderateOfficers.length} officers scored moderate and are within range of the strong threshold with targeted review.`,
  ]

  const assignedOfficers = [[...weakOfficers, ...moderateOfficers], weakOfficers, moderateOfficers]

  const ranked = mockCourseCatalog
    .map((course, i) => ({ course, reason: reasons[i], officers: assignedOfficers[i] }))
    .sort((a, b) => b.officers.length - a.officers.length)

  const totalAssignments = ranked.reduce((sum, entry) => sum + entry.officers.length, 0)

  return (
    <div>
      <p className="max-w-[68ch] text-h1 font-semibold leading-snug text-text-primary">
        To close the gap in <span className="text-weak">{weakest.label.toLowerCase()}</span>,
        assign these {ranked.length} iGOT Karmayogi courses across the cohort.
      </p>
      <p className="mt-2 text-caption text-text-secondary">
        {totalAssignments} officer assignments recommended, ranked by reach.
      </p>

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        {ranked.map(({ course, reason, officers }, i) => {
          const isExpanded = expandedIndex === i
          const isLead = i === 0

          return (
            <div
              key={course.title}
              className={`bg-surface transition-colors hover:bg-surface-alt ${isLead ? 'p-6' : 'p-4'}`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex shrink-0 items-center justify-center rounded-sm font-semibold tabular-nums ${
                    isLead
                      ? 'size-8 bg-primary text-body text-white'
                      : 'size-6 bg-surface-alt text-caption text-text-muted'
                  }`}
                >
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                      {course.provider}
                    </span>
                    <span className="text-micro text-text-muted">{course.format}</span>
                  </div>

                  <h3
                    className={`mt-1.5 font-semibold text-text-primary ${isLead ? 'text-h1' : 'text-h2'}`}
                  >
                    {course.title}
                  </h3>

                  <p className={`mt-1.5 text-text-secondary ${isLead ? 'text-body' : 'text-caption'}`}>
                    {reason}
                  </p>

                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : i)}
                    className="mt-3 flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
                  >
                    {isExpanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                    {officers.length} officer{officers.length === 1 ? '' : 's'} assigned
                  </button>

                  {isExpanded && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {officers.map((name) => (
                        <span
                          key={name}
                          className="rounded-sm border border-border bg-surface-alt px-2 py-0.5 text-caption text-text-secondary"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-6 rounded-sm border border-border bg-surface px-4 py-2 text-body font-medium text-text-primary transition-colors hover:bg-surface-alt"
      >
        Start a new assessment
      </button>
    </div>
  )
}
