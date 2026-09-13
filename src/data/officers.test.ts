import { describe, expect, it } from 'vitest'
import { FEATURED_OFFICER_ID, officers } from './officers'

describe('officers', () => {
  it('has 30 officers with unique ids', () => {
    expect(officers).toHaveLength(30)
    expect(new Set(officers.map((o) => o.id)).size).toBe(30)
  })

  it('gives every officer a non-empty name and department id', () => {
    officers.forEach((officer) => {
      expect(officer.name.length).toBeGreaterThan(0)
      expect(officer.departmentId.length).toBeGreaterThan(0)
    })
  })

  it('includes the featured officer', () => {
    expect(officers.some((o) => o.id === FEATURED_OFFICER_ID)).toBe(true)
  })

  it('spreads officers across exactly 6 departments', () => {
    const departmentIds = new Set(officers.map((o) => o.departmentId))
    expect(departmentIds.size).toBe(6)
  })
})
