import { CheckCircle, CircleDashed, Clock } from '@phosphor-icons/react'
import { type BannerVariant, type CourseAssignmentDetail, getOfficerCourseAssignments } from '../../data/courses'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'

// Decorative-only gradient variety for the course catalog's illustration-banner slot — a
// narrow, spec-sanctioned exception to the app's locked-token color rule (spec §5). Never
// reuse these for anything that carries meaning (status, score, category identity).
const bannerClass: Record<BannerVariant, string> = {
  teal: 'bg-gradient-to-br from-teal-400 to-teal-700',
  coral: 'bg-gradient-to-br from-orange-300 to-rose-600',
  violet: 'bg-gradient-to-br from-violet-400 to-indigo-700',
  amber: 'bg-gradient-to-br from-amber-300 to-orange-600',
  forest: 'bg-gradient-to-br from-emerald-400 to-teal-800',
  slate: 'bg-gradient-to-br from-slate-400 to-slate-700',
  rose: 'bg-gradient-to-br from-pink-300 to-rose-700',
  sky: 'bg-gradient-to-br from-sky-300 to-blue-700',
}

const statusMeta: Record<
  CourseAssignmentDetail['status'],
  { label: string; pillClass: string; icon: typeof CheckCircle }
> = {
  not_started: { label: 'Not Started', pillClass: 'bg-insufficient-tint text-insufficient', icon: CircleDashed },
  in_progress: { label: 'In Progress', pillClass: 'bg-moderate-tint text-moderate', icon: Clock },
  completed: { label: 'Completed', pillClass: 'bg-strong-tint text-strong', icon: CheckCircle },
}

function CourseCard({ assignment }: { assignment: CourseAssignmentDetail }) {
  const meta = statusMeta[assignment.status]
  const StatusIcon = meta.icon

  return (
    <div className="card-lift overflow-hidden rounded-sm border border-border bg-surface">
      <div className={`h-20 ${bannerClass[assignment.course.bannerVariant]}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-caption font-medium text-text-muted">{assignment.course.code}</span>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium ${meta.pillClass}`}
          >
            <StatusIcon size={12} weight="fill" />
            {meta.label}
          </span>
        </div>

        <h2 className="mt-1.5 text-h2 font-semibold text-text-primary">{assignment.course.title}</h2>
        <p className="mt-1 text-caption text-text-muted">
          {assignment.course.provider} · {assignment.course.format}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-caption">
            <span className="text-text-secondary">Progress</span>
            <span className="font-medium tabular-nums text-text-primary">{assignment.percentComplete}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-sm bg-surface-alt">
            <div className="h-full bg-primary" style={{ width: `${assignment.percentComplete}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-caption text-text-muted">
          <span>
            {assignment.modulesCompleted}/{assignment.course.modulesTotal} modules
          </span>
          <span>
            Due{' '}
            {new Date(assignment.dueDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export function OfficerCourses() {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const assignments = getOfficerCourseAssignments(officer.id)

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">My Courses</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">
        {assignments.length} course{assignments.length === 1 ? '' : 's'} assigned to{' '}
        {officer.name.split(' ')[0]} this cycle.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assignments.map((assignment) => (
          <CourseCard key={assignment.courseId} assignment={assignment} />
        ))}
      </div>
    </div>
  )
}
