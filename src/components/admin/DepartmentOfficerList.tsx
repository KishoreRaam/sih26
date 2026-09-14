import { CaretLeft } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, getOfficerOverallScore } from '../../data/competencyDomains'
import {
  type DepartmentStatus,
  departments,
  getDepartmentAvgScore,
  getDepartmentOfficers,
  getDepartmentStatus,
} from '../../data/departments'
import { levelFromScore } from '../../data/thresholds'

interface DepartmentOfficerListProps {
  departmentId: string
  onBack: () => void
  onSelectOfficer: (officerId: string) => void
}

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

const levelClass: Record<'strong' | 'moderate' | 'weak', string> = {
  strong: 'bg-strong-tint text-strong',
  moderate: 'bg-moderate-tint text-moderate',
  weak: 'bg-weak-tint text-weak',
}

const levelLabel: Record<'strong' | 'moderate' | 'weak', string> = {
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
}

export function DepartmentOfficerList({ departmentId, onBack, onSelectOfficer }: DepartmentOfficerListProps) {
  const department = departments.find((d) => d.id === departmentId)!
  const officersInDept = getDepartmentOfficers(departmentId)
  const avgScore = getDepartmentAvgScore(departmentId)
  const status = getDepartmentStatus(departmentId)

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-hover"
      >
        <CaretLeft size={14} />
        Back to departments
      </button>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-caption text-text-muted">{department.code}</p>
          <h2 className="mt-0.5 text-h1 font-semibold text-text-primary">{department.name}</h2>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-micro font-medium ${statusClass[status]}`}>
          {statusLabel[status]}
        </span>
      </div>
      <p className="mt-1 text-caption text-text-secondary">
        {avgScore}% average competency across {officersInDept.length} officers.
      </p>

      <div className="mt-4 overflow-hidden rounded-sm border border-border">
        <div className="grid grid-cols-[2fr_1fr_1fr] border-b border-border bg-surface-alt">
          <span className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">Officer</span>
          <span className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">Score</span>
          <span className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">Level</span>
        </div>
        {officersInDept.map((officer) => {
          const score = getOfficerOverallScore(officer.id, CURRENT_CYCLE_ID)
          const level = levelFromScore(score)
          return (
            <button
              key={officer.id}
              type="button"
              onClick={() => onSelectOfficer(officer.id)}
              className="grid w-full grid-cols-[2fr_1fr_1fr] items-center border-b border-border bg-surface text-left transition-colors last:border-b-0 hover:bg-surface-alt"
            >
              <span className="truncate px-3 py-2.5 text-body text-text-primary">{officer.name}</span>
              <span className="px-3 py-2.5 text-cell font-medium tabular-nums text-text-primary">{score}%</span>
              <span className="px-3 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${levelClass[level]}`}>
                  {levelLabel[level]}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
