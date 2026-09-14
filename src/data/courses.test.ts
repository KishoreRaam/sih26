import { describe, expect, it } from 'vitest'
import {
  courses,
  filterCourseAssignments,
  getAllAssignmentsWithDetails,
  getCourseById,
  getOfficerCourseAssignments,
} from './courses'
import { FEATURED_OFFICER_ID, officers } from './officers'

describe('courses', () => {
  it('has 8 courses spanning all 4 domains', () => {
    expect(courses).toHaveLength(8)
    const domainIds = new Set(courses.map((c) => c.domainId))
    expect(domainIds).toEqual(new Set(['statistical', 'technical', 'governance', 'behavioural']))
  })

  it('has unique ids and codes', () => {
    expect(new Set(courses.map((c) => c.id)).size).toBe(8)
    expect(new Set(courses.map((c) => c.code)).size).toBe(8)
  })
})

describe('getCourseById', () => {
  it('returns the matching course', () => {
    expect(getCourseById('sta-101')?.title).toBe('Applied Statistical Computing for Official Statistics')
  })

  it('returns undefined for an unknown id', () => {
    expect(getCourseById('does-not-exist')).toBeUndefined()
  })
})

describe('getOfficerCourseAssignments (featured officer)', () => {
  it("returns Rohit's 5 hand-authored assignments with course details attached", () => {
    const result = getOfficerCourseAssignments(FEATURED_OFFICER_ID)
    expect(result).toHaveLength(5)
    result.forEach((entry) => {
      expect(entry.course.id).toBe(entry.courseId)
    })
    const completed = result.filter((entry) => entry.status === 'completed')
    const inProgress = result.filter((entry) => entry.status === 'in_progress')
    const notStarted = result.filter((entry) => entry.status === 'not_started')
    expect(completed).toHaveLength(3)
    expect(inProgress).toHaveLength(1)
    expect(notStarted).toHaveLength(1)
  })
})

describe('getOfficerCourseAssignments (generated officers)', () => {
  it('gives every non-featured officer exactly 3 assignments to distinct courses', () => {
    officers
      .filter((o) => o.id !== FEATURED_OFFICER_ID)
      .forEach((officer) => {
        const result = getOfficerCourseAssignments(officer.id)
        expect(result).toHaveLength(3)
        expect(new Set(result.map((r) => r.courseId)).size).toBe(3)
      })
  })

  it('keeps percentComplete and modulesCompleted consistent with status', () => {
    officers.forEach((officer) => {
      getOfficerCourseAssignments(officer.id).forEach((entry) => {
        if (entry.status === 'completed') expect(entry.percentComplete).toBe(100)
        if (entry.status === 'not_started') expect(entry.percentComplete).toBe(0)
        expect(entry.modulesCompleted).toBeLessThanOrEqual(entry.course.modulesTotal)
        expect(entry.modulesCompleted).toBeGreaterThanOrEqual(0)
      })
    })
  })

  it('is deterministic across repeated calls', () => {
    const first = getOfficerCourseAssignments('ananya-krishnan')
    const second = getOfficerCourseAssignments('ananya-krishnan')
    expect(first).toEqual(second)
  })
})

describe('getAllAssignmentsWithDetails', () => {
  it('returns one entry per officer-course assignment with officer and course attached', () => {
    const all = getAllAssignmentsWithDetails()
    expect(all.length).toBe(5 + (officers.length - 1) * 3)
    all.forEach((entry) => {
      expect(entry.officer.id).toBe(entry.officerId)
      expect(entry.course.id).toBe(entry.courseId)
    })
  })
})

describe('filterCourseAssignments', () => {
  const all = getAllAssignmentsWithDetails()

  it('returns everything when no filters are given', () => {
    expect(filterCourseAssignments(all, {})).toHaveLength(all.length)
  })

  it('filters by department', () => {
    const result = filterCourseAssignments(all, { departmentId: 'fod' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((entry) => entry.officer.departmentId === 'fod')).toBe(true)
  })

  it('filters by course', () => {
    const result = filterCourseAssignments(all, { courseId: 'sta-101' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((entry) => entry.courseId === 'sta-101')).toBe(true)
  })

  it('filters by status', () => {
    const result = filterCourseAssignments(all, { status: 'completed' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((entry) => entry.status === 'completed')).toBe(true)
  })

  it('combines all three filters', () => {
    const result = filterCourseAssignments(all, { departmentId: 'fod', status: 'completed' })
    result.forEach((entry) => {
      expect(entry.officer.departmentId).toBe('fod')
      expect(entry.status).toBe('completed')
    })
  })
})
