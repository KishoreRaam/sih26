import { Books, ChartLineUp, CheckCircle, ClockCountdown } from '@phosphor-icons/react'
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
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'
import { SegmentedBar } from '../shared/SegmentedBar'
import { StatCard } from '../shared/StatCard'
import { TrendBarChart } from '../shared/TrendBarChart'

const domainColorClass: Record<DomainId, string> = {
  statistical: 'bg-primary',
  technical: 'bg-secondary',
  governance: 'bg-accent',
  behavioural: 'bg-text-secondary',
}

function trendMeta(current: number, previous: number) {
  const delta = current - previous
  return {
    trend: (delta >= 0 ? 'up' : 'down') as 'up' | 'down',
    deltaLabel: `${delta >= 0 ? '+' : ''}${delta} vs previous cycle`,
  }
}

export function OfficerDashboard() {
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
                value: entry.score ?? 0,
                colorClass: domainColorClass[entry.domain.id],
              }))}
            />
          </div>

          <div className="mt-4 divide-y divide-border">
            {domainScores.map((entry) => (
              <div key={entry.domain.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-body text-text-primary">{entry.domain.name}</span>
                {entry.confidence === 'insufficient' ? (
                  <span className="rounded-sm border border-dashed border-insufficient bg-surface px-2 py-0.5 text-micro font-medium text-insufficient">
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
    </div>
  )
}
