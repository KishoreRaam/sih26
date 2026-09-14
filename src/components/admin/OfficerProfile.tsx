import { Books, CaretLeft, ChartLineUp, CheckCircle, ClockCountdown } from '@phosphor-icons/react'
import {
  assessmentCycles,
  CURRENT_CYCLE_ID,
  type DomainId,
  domains,
  getOfficerAssessedCount,
  getOfficerDomainScore,
  getOfficerEngagement,
  getOfficerOverallScore,
  getPreviousCycleId,
  taxonomyCompetencies,
} from '../../data/competencyDomains'
import { type AssignmentStatus, getOfficerCourseAssignments } from '../../data/courses'
import { departments, getDepartmentAvgScore } from '../../data/departments'
import { officers } from '../../data/officers'
import { SegmentedBar } from '../shared/SegmentedBar'
import { StatCard } from '../shared/StatCard'
import { TrendBarChart } from '../shared/TrendBarChart'

const domainColorClass: Record<DomainId, string> = {
  statistical: 'bg-primary',
  technical: 'bg-secondary',
  governance: 'bg-accent',
  behavioural: 'bg-text-secondary',
}

const courseStatusMeta: Record<AssignmentStatus, { label: string; pillClass: string }> = {
  not_started: { label: 'Not Started', pillClass: 'bg-insufficient-tint text-insufficient' },
  in_progress: { label: 'In Progress', pillClass: 'bg-moderate-tint text-moderate' },
  completed: { label: 'Completed', pillClass: 'bg-strong-tint text-strong' },
}

function trendMeta(current: number, previous: number) {
  const delta = current - previous
  return {
    trend: (delta >= 0 ? 'up' : 'down') as 'up' | 'down',
    deltaLabel: `${delta >= 0 ? '+' : ''}${delta} vs previous cycle`,
  }
}

interface OfficerProfileProps {
  officerId: string
  onBack: () => void
}

export function OfficerProfile({ officerId, onBack }: OfficerProfileProps) {
  const officer = officers.find((o) => o.id === officerId)!
  const department = departments.find((d) => d.id === officer.departmentId)!
  const previousCycleId = getPreviousCycleId(CURRENT_CYCLE_ID)!

  const currentOverall = getOfficerOverallScore(officer.id, CURRENT_CYCLE_ID)
  const previousOverall = getOfficerOverallScore(officer.id, previousCycleId)
  const currentAssessed = getOfficerAssessedCount(officer.id, CURRENT_CYCLE_ID)
  const previousAssessed = getOfficerAssessedCount(officer.id, previousCycleId)
  const currentEngagement = getOfficerEngagement(officer.id, CURRENT_CYCLE_ID)
  const previousEngagement = getOfficerEngagement(officer.id, previousCycleId)

  const domainScores = domains.map((domain) => ({
    domain,
    ...getOfficerDomainScore(officer.id, domain.id, CURRENT_CYCLE_ID),
  }))

  const overallTrend = trendMeta(currentOverall, previousOverall)
  const assessedTrend = trendMeta(currentAssessed, previousAssessed)
  const hoursTrend = trendMeta(currentEngagement.learningHours, previousEngagement.learningHours)
  const coursesTrend = trendMeta(currentEngagement.coursesCompleted, previousEngagement.coursesCompleted)

  const chartPoints = assessmentCycles.map((cycle) => ({
    label: cycle.label.replace(' (Current)', ''),
    value: getOfficerOverallScore(officer.id, cycle.id),
  }))

  const courseAssignments = getOfficerCourseAssignments(officer.id)
  const departmentAvg = getDepartmentAvgScore(department.id)

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
      >
        <CaretLeft size={14} />
        Back to {department.name}
      </button>

      <h1 className="mt-3 text-title font-semibold text-text-primary">{officer.name}'s Profile</h1>
      <p className="mt-2 text-body text-text-secondary">
        {department.code} · {department.name} · Department average {departmentAvg}%
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${currentOverall}%`}
          previousLabel={`${previousOverall}% previous cycle`}
          deltaLabel={overallTrend.deltaLabel}
          trend={overallTrend.trend}
          icon={ChartLineUp}
        />
        <StatCard
          label="Competencies Assessed"
          value={`${currentAssessed} of ${taxonomyCompetencies.length}`}
          previousLabel={`${previousAssessed} of ${taxonomyCompetencies.length} previous cycle`}
          deltaLabel={assessedTrend.deltaLabel}
          trend={assessedTrend.trend}
          icon={CheckCircle}
        />
        <StatCard
          label="Learning Hours"
          value={`${currentEngagement.learningHours}h`}
          previousLabel={`${previousEngagement.learningHours}h previous cycle`}
          deltaLabel={hoursTrend.deltaLabel}
          trend={hoursTrend.trend}
          icon={ClockCountdown}
        />
        <StatCard
          label="Courses Completed"
          value={`${currentEngagement.coursesCompleted}`}
          previousLabel={`${previousEngagement.coursesCompleted} previous cycle`}
          deltaLabel={coursesTrend.deltaLabel}
          trend={coursesTrend.trend}
          icon={Books}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">Competency score across cycles</p>
          <div className="mt-4">
            <TrendBarChart points={chartPoints} />
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">Competency Domains</p>
          <div className="mt-4">
            <SegmentedBar
              segments={domainScores.map((entry) => ({
                id: entry.domain.id,
                label: entry.domain.name,
                value: taxonomyCompetencies.filter((c) => c.domainId === entry.domain.id).length,
                colorClass: domainColorClass[entry.domain.id],
              }))}
            />
          </div>
          <div className="mt-4 divide-y divide-border">
            {domainScores.map((entry) => (
              <div key={entry.domain.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-body text-text-primary">{entry.domain.name}</span>
                {entry.confidence === 'insufficient' ? (
                  <span className="rounded-full border border-dashed border-insufficient bg-surface px-2 py-0.5 text-micro font-medium text-insufficient">
                    Insufficient data
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="text-cell font-medium tabular-nums text-text-primary">{entry.score}%</span>
                    {entry.confidence === 'partial' && (
                      <span className="text-micro text-text-muted">(partial)</span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-sm border border-border bg-surface p-4">
        <p className="text-h2 font-semibold text-text-primary">Course Progress</p>
        <div className="mt-3 divide-y divide-border">
          {courseAssignments.map((assignment) => {
            const meta = courseStatusMeta[assignment.status]
            return (
              <div key={assignment.courseId} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-text-primary">{assignment.course.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-sm bg-surface-alt">
                      <div className="h-full bg-primary" style={{ width: `${assignment.percentComplete}%` }} />
                    </div>
                    <span className="text-micro tabular-nums text-text-muted">{assignment.percentComplete}%</span>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${meta.pillClass}`}>
                  {meta.label}
                </span>
              </div>
            )
          })}
          {courseAssignments.length === 0 && (
            <p className="py-2.5 text-caption text-text-muted">No courses assigned.</p>
          )}
        </div>
      </div>
    </div>
  )
}
