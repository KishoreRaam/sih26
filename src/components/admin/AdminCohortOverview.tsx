import { CalendarBlank, CaretRight, UsersThree } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, domains, getOfficerDomainScore } from '../../data/competencyDomains'
import {
  type DepartmentStatus,
  departments,
  getDepartmentAssessedFraction,
  getDepartmentAvgScore,
  getDepartmentOfficers,
  getDepartmentStatus,
} from '../../data/departments'
import { HeatSparkline } from '../shared/HeatSparkline'

const statusLabel: Record<DepartmentStatus, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  critical: 'Critical',
}

const statusClass: Record<DepartmentStatus, string> = {
  on_track: 'bg-strong-tint text-strong',
  at_risk: 'bg-moderate-tint text-moderate',
  critical: 'bg-weak-tint text-weak',
}

function departmentDomainCells(departmentId: string) {
  const deptOfficers = getDepartmentOfficers(departmentId)
  return domains.map((domain) => {
    const scores = deptOfficers
      .map((officer) => getOfficerDomainScore(officer.id, domain.id, CURRENT_CYCLE_ID).score)
      .filter((score): score is number => score !== null)
    const score = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null
    return { id: domain.id, label: domain.name, score }
  })
}

interface AdminCohortOverviewProps {
  onSelectDepartment: (departmentId: string) => void
}

export function AdminCohortOverview({ onSelectDepartment }: AdminCohortOverviewProps) {
  return (
    <div>
      <p className="text-caption text-text-muted">{departments.length} departments</p>

      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((department) => {
          const status = getDepartmentStatus(department.id)
          const avgScore = getDepartmentAvgScore(department.id)
          const { assessed, total } = getDepartmentAssessedFraction(department.id)

          return (
            <div key={department.id} className="card-lift rounded-sm border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-caption text-text-muted">{department.code}</p>
                  <h2 className="mt-0.5 text-h1 font-semibold text-text-primary">{department.name}</h2>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${statusClass[status]}`}>
                  {statusLabel[status]}
                </span>
              </div>

              <div className="mt-4">
                <HeatSparkline cells={departmentDomainCells(department.id)} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-caption">
                  <span className="text-text-secondary">Avg competency</span>
                  <span className="font-medium tabular-nums text-text-primary">{avgScore}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
                  <div className="h-full bg-primary" style={{ width: `${avgScore}%` }} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-caption">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <UsersThree size={14} />
                  Officers assessed
                </span>
                <span className="font-medium tabular-nums text-text-primary">
                  {assessed}/{total}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-caption">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <CalendarBlank size={14} />
                  Next review
                </span>
                <span className="font-medium text-text-primary">
                  {new Date(department.nextReviewDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectDepartment(department.id)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-caption font-medium text-text-primary transition-colors hover:bg-surface-alt"
              >
                View officers
                <CaretRight size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
