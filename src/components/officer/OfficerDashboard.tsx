import { Books, ChartLineUp, CheckCircle, ClockCountdown } from '@phosphor-icons/react'
import {
  assessmentCycles,
  CURRENT_CYCLE_ID,
  type DomainId,
  domains,
  getOfficerAssessedCount,
  getOfficerDomainScore,
  getOfficerEngagement,
  getOfficerExpertise,
  getOfficerOverallScore,
  getPreviousCycleId,
  type OfficerExpertise,
  taxonomyCompetencies,
} from '../../data/competencyDomains'
import { getOfficerCourseAssignments, type CourseAssignmentDetail } from '../../data/courses'
import { getDepartmentAssessedFraction, getDepartmentAvgScore, departments } from '../../data/departments'
import { FEATURED_OFFICER_ID, officers, type Officer } from '../../data/officers'
import { SegmentedBar } from '../shared/SegmentedBar'
import { StatCard } from '../shared/StatCard'
import { TrendBarChart } from '../shared/TrendBarChart'

const domainColorClass: Record<DomainId, string> = {
  statistical: 'bg-primary',
  technical: 'bg-secondary',
  governance: 'bg-accent',
  behavioural: 'bg-text-secondary',
}

const courseSummaryPriority: Record<CourseAssignmentDetail['status'], number> = {
  in_progress: 0,
  not_started: 1,
  completed: 2,
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function trendMeta(current: number, previous: number) {
  const delta = current - previous
  return {
    trend: (delta >= 0 ? 'up' : 'down') as 'up' | 'down',
    deltaLabel: `${delta >= 0 ? '+' : ''}${delta} vs previous cycle`,
  }
}

interface OfficerDashboardProps {
  onNavigate?: (section: 'courses' | 'connect') => void
}

export function OfficerDashboard({ onNavigate }: OfficerDashboardProps) {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
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

  const scoredDomains = domainScores.filter((entry) => entry.score !== null)
  const weakestDomain = scoredDomains.reduce(
    (min, entry) => (entry.score! < min.score! ? entry : min),
    scoredDomains[0] ?? domainScores[0],
  )

  const gapCount = taxonomyCompetencies.length - currentAssessed
  const totalAvgScore =
    scoredDomains.length > 0
      ? Math.round(scoredDomains.reduce((sum, entry) => sum + entry.score!, 0) / scoredDomains.length)
      : 0

  const overallTrend = trendMeta(currentOverall, previousOverall)
  const assessedTrend = trendMeta(currentAssessed, previousAssessed)
  const hoursTrend = trendMeta(currentEngagement.learningHours, previousEngagement.learningHours)
  const coursesTrend = trendMeta(currentEngagement.coursesCompleted, previousEngagement.coursesCompleted)

  const chartPoints = assessmentCycles.map((cycle) => ({
    label: cycle.label.replace(' (Current)', ''),
    value: getOfficerOverallScore(officer.id, cycle.id),
  }))

  const courseAssignments = getOfficerCourseAssignments(officer.id)
  const courseSummary = [...courseAssignments]
    .sort((a, b) => courseSummaryPriority[a.status] - courseSummaryPriority[b.status])
    .slice(0, 3)

  const department = departments.find((d) => d.id === officer.departmentId)!
  const departmentAvg = getDepartmentAvgScore(department.id)
  const departmentAssessed = getDepartmentAssessedFraction(department.id)

  const connectSuggestions = officers
    .filter((o) => o.id !== officer.id)
    .map((o) => ({ officer: o, expertise: getOfficerExpertise(o.id, CURRENT_CYCLE_ID) }))
    .filter(
      (entry): entry is { officer: Officer; expertise: OfficerExpertise } =>
        entry.expertise !== null && entry.expertise.domain.id === weakestDomain.domain.id,
    )
    .sort((a, b) => b.expertise.score - a.expertise.score)
    .slice(0, 3)

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">Welcome back, {officer.name.split(' ')[0]}</h1>
      <p className="mt-2 max-w-[68ch] text-body text-text-secondary">
        You have {gapCount} competenc{gapCount === 1 ? 'y' : 'ies'} without a current-cycle score, and{' '}
        {weakestDomain.domain.name.toLowerCase()} is your area with the most room to grow.
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
          <p className="mt-1 text-metric font-semibold tabular-nums text-text-primary">{totalAvgScore}%</p>
          <p className="text-caption text-text-muted">Average across {domains.length} domains</p>

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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-h2 font-semibold text-text-primary">My Courses</p>
            <button
              type="button"
              onClick={() => onNavigate?.('courses')}
              className="text-caption font-medium text-primary hover:text-primary-hover"
            >
              View all
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {courseSummary.map((assignment) => (
              <div key={assignment.courseId}>
                <div className="flex items-center justify-between gap-2 text-caption">
                  <span className="truncate text-text-primary">{assignment.course.title}</span>
                  <span className="shrink-0 tabular-nums text-text-muted">{assignment.percentComplete}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
                  <div className="h-full bg-primary" style={{ width: `${assignment.percentComplete}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <p className="text-h2 font-semibold text-text-primary">My Department</p>
          <p className="mt-1 text-caption text-text-muted">
            {department.code} · {department.name}
          </p>
          <div className="mt-3 flex items-center justify-between text-caption">
            <span className="text-text-secondary">Avg competency</span>
            <span className="font-medium tabular-nums text-text-primary">{departmentAvg}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
            <div className="h-full bg-primary" style={{ width: `${departmentAvg}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-caption">
            <span className="text-text-secondary">Officers assessed</span>
            <span className="font-medium tabular-nums text-text-primary">
              {departmentAssessed.assessed}/{departmentAssessed.total}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-h2 font-semibold text-text-primary">Connect Suggestions</p>
            <button
              type="button"
              onClick={() => onNavigate?.('connect')}
              className="text-caption font-medium text-primary hover:text-primary-hover"
            >
              View all
            </button>
          </div>
          <p className="mt-1 text-caption text-text-muted">
            Officers strong in {weakestDomain.domain.name.toLowerCase()}, your area with the most room to grow.
          </p>
          <div className="mt-3 space-y-2">
            {connectSuggestions.map(({ officer: suggested, expertise }) => (
              <div key={suggested.id} className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-tint text-caption font-semibold text-primary">
                  {initials(suggested.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-caption font-medium text-text-primary">{suggested.name}</p>
                  <p className="truncate text-micro text-text-muted">
                    {expertise.domain.name} · {expertise.score}%
                  </p>
                </div>
              </div>
            ))}
            {connectSuggestions.length === 0 && (
              <p className="text-caption text-text-muted">No matching officers this cycle.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
