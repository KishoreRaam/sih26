import { CURRENT_CYCLE_ID, getOfficerWeakestCompetencies } from '../../data/competencyDomains'
import { FEATURED_OFFICER_ID, officers } from '../../data/officers'
import { mockCourseCatalog } from '../../mockData'

export function OfficerCourses() {
  const officer = officers.find((o) => o.id === FEATURED_OFFICER_ID)!
  const weakest = getOfficerWeakestCompetencies(officer.id, CURRENT_CYCLE_ID, mockCourseCatalog.length)

  const assignments = mockCourseCatalog.map((course, index) => ({
    course,
    competency: weakest[index]?.competency,
    score: weakest[index]?.score,
  }))

  return (
    <div>
      <h1 className="text-title font-semibold text-text-primary">My Courses</h1>
      <p className="mt-2 max-w-[65ch] text-body text-text-secondary">
        Training recommended for {officer.name.split(' ')[0]} based on this cycle&apos;s lowest-scoring
        competencies.
      </p>

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        {assignments.map(({ course, competency, score }) => (
          <div key={course.title} className="bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex w-fit items-center rounded-sm bg-accent-tint px-2 py-0.5 text-micro font-medium text-accent">
                {course.provider}
              </span>
              <span className="text-micro text-text-muted">{course.format}</span>
            </div>
            <h2 className="mt-1.5 text-h1 font-semibold text-text-primary">{course.title}</h2>
            {competency && (
              <p className="mt-1.5 text-body text-text-secondary">
                Targets <span className="font-medium text-text-primary">{competency.label}</span>, your
                current lowest score at {score}%.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
