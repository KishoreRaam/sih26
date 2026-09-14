import { CURRENT_CYCLE_ID, getOfficerWeakestCompetencies } from '../../data/competencyDomains'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'
import { mockCourseCatalog } from '../../mockData'

export function OfficerCourses() {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const weakest = getOfficerWeakestCompetencies(officer.id, CURRENT_CYCLE_ID, mockCourseCatalog.length)

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">My Courses</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">
        Training recommended for {officer.name.split(' ')[0]} this cycle.
      </p>

      {weakest.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {weakest.map(({ competency, score }) => (
            <span
              key={competency.id}
              className="rounded-sm border border-border bg-surface-alt px-2 py-1 text-caption text-text-secondary"
            >
              <span className="font-medium text-text-primary">{competency.label}</span> ({score}%)
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        {mockCourseCatalog.map((course) => (
          <div key={course.title} className="bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                {course.provider}
              </span>
              <span className="text-micro text-text-muted">{course.format}</span>
            </div>
            <h2 className="mt-1.5 text-h1 font-semibold text-text-primary">{course.title}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}
