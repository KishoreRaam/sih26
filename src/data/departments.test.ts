import { describe, expect, it } from 'vitest'
import {
  departments,
  getDepartmentAssessedFraction,
  getDepartmentAvgScore,
  getDepartmentOfficers,
  getDepartmentStatus,
} from './departments'
import { officers } from './officers'

describe('departments', () => {
  it('has 6 departments with unique ids and codes', () => {
    expect(departments).toHaveLength(6)
    expect(new Set(departments.map((d) => d.id)).size).toBe(6)
    expect(new Set(departments.map((d) => d.code)).size).toBe(6)
  })

  it('accounts for every officer across exactly the department ids that exist', () => {
    const departmentIds = new Set(departments.map((d) => d.id))
    officers.forEach((officer) => expect(departmentIds.has(officer.departmentId)).toBe(true))
  })
})

describe('getDepartmentOfficers', () => {
  it('returns only officers belonging to that department', () => {
    const fodOfficers = getDepartmentOfficers('fod')
    expect(fodOfficers.length).toBeGreaterThan(0)
    fodOfficers.forEach((officer) => expect(officer.departmentId).toBe('fod'))
  })
})

describe('getDepartmentAvgScore / getDepartmentStatus', () => {
  it('derives a status consistent with the average score and the shared thresholds', () => {
    departments.forEach((department) => {
      const avg = getDepartmentAvgScore(department.id)
      const status = getDepartmentStatus(department.id)
      if (avg >= 76) expect(status).toBe('on_track')
      else if (avg >= 55) expect(status).toBe('at_risk')
      else expect(status).toBe('critical')
    })
  })

  it('produces at least two different statuses across the 6 departments', () => {
    const statuses = new Set(departments.map((d) => getDepartmentStatus(d.id)))
    expect(statuses.size).toBeGreaterThan(1)
  })
})

describe('getDepartmentAssessedFraction', () => {
  it('never reports more assessed officers than the department total', () => {
    departments.forEach((department) => {
      const { assessed, total } = getDepartmentAssessedFraction(department.id)
      expect(total).toBe(getDepartmentOfficers(department.id).length)
      expect(assessed).toBeLessThanOrEqual(total)
      expect(assessed).toBeGreaterThanOrEqual(0)
    })
  })
})
