import { useMemo, useState } from 'react'
import { type AssignmentStatus, courses, filterCourseAssignments, getAllAssignmentsWithDetails } from '../../data/courses'
import { departments } from '../../data/departments'

const statusMeta: Record<AssignmentStatus, { label: string; pillClass: string }> = {
  not_started: { label: 'Not Started', pillClass: 'bg-insufficient-tint text-insufficient' },
  in_progress: { label: 'In Progress', pillClass: 'bg-moderate-tint text-moderate' },
  completed: { label: 'Completed', pillClass: 'bg-strong-tint text-strong' },
}

export function CourseProgressBoard() {
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const allAssignments = useMemo(() => getAllAssignmentsWithDetails(), [])

  const filtered = useMemo(() => {
    return filterCourseAssignments(allAssignments, {
      departmentId: departmentFilter === 'all' ? undefined : departmentFilter,
      courseId: courseFilter === 'all' ? undefined : courseFilter,
      status: statusFilter === 'all' ? undefined : (statusFilter as AssignmentStatus),
    })
  }, [allAssignments, departmentFilter, courseFilter, statusFilter])

  const hasActiveFilters = departmentFilter !== 'all' || courseFilter !== 'all' || statusFilter !== 'all'

  return (
    <div>
      <p className="text-caption text-text-muted">
        {filtered.length} of {allAssignments.length} assignments
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All statuses</option>
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setDepartmentFilter('all')
              setCourseFilter('all')
              setStatusFilter('all')
            }}
            className="text-caption font-medium text-primary hover:text-primary-hover"
          >
            Reset filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-sm border border-border">
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.2fr_1fr] border-b border-border bg-surface-alt">
          {['Officer', 'Course', 'Department', 'Status', 'Progress', 'Due date'].map((heading) => (
            <span key={heading} className="px-3 py-2.5 text-h3 font-semibold uppercase tracking-wide text-text-primary">
              {heading}
            </span>
          ))}
        </div>
        {filtered.map((entry) => {
          const department = departments.find((d) => d.id === entry.officer.departmentId)!
          const meta = statusMeta[entry.status]
          return (
            <div
              key={`${entry.officerId}-${entry.courseId}`}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.2fr_1fr] items-center border-b border-border bg-surface px-0 py-2.5 last:border-b-0 hover:bg-surface-alt"
            >
              <span className="truncate px-3 text-body text-text-primary">{entry.officer.name}</span>
              <span className="truncate px-3 text-caption text-text-secondary">{entry.course.title}</span>
              <span className="truncate px-3 text-caption text-text-secondary">{department.code}</span>
              <span className="px-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-micro font-medium ${meta.pillClass}`}>
                  {meta.label}
                </span>
              </span>
              <span className="px-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-sm bg-surface-alt">
                    <div className="h-full bg-primary" style={{ width: `${entry.percentComplete}%` }} />
                  </div>
                  <span className="text-micro tabular-nums text-text-muted">{entry.percentComplete}%</span>
                </div>
              </span>
              <span className="px-3 text-caption text-text-secondary">
                {new Date(entry.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-caption text-text-muted">No assignments match the current filters.</p>
        )}
      </div>
    </div>
  )
}
