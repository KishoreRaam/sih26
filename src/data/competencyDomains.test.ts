import { describe, expect, it } from 'vitest'
import {
  CURRENT_CYCLE_ID,
  assessmentCycles,
  getOfficerAssessedCount,
  getOfficerDomainScore,
  getOfficerEngagement,
  getOfficerExpertise,
  getOfficerOverallScore,
  getOfficerWeakestCompetencies,
  getPreviousCycleId,
  getRawScore,
  isOfficerFullyAssessed,
  taxonomyCompetencies,
} from './competencyDomains'
import { FEATURED_OFFICER_ID, officers } from './officers'

describe('taxonomyCompetencies', () => {
  it('covers all four domains', () => {
    const domainIds = new Set(taxonomyCompetencies.map((c) => c.domainId))
    expect(domainIds).toEqual(new Set(['statistical', 'technical', 'governance', 'behavioural']))
  })

  it('has exactly 10 competencies', () => {
    expect(taxonomyCompetencies).toHaveLength(10)
  })
})

describe('getOfficerOverallScore (featured officer)', () => {
  it('computes the cycle-4 overall score excluding the insufficient competency', () => {
    expect(getOfficerOverallScore(FEATURED_OFFICER_ID, 'cycle-4')).toBe(67)
  })

  it('computes the cycle-3 overall score', () => {
    expect(getOfficerOverallScore(FEATURED_OFFICER_ID, 'cycle-3')).toBe(60)
  })
})

describe('getOfficerAssessedCount / isOfficerFullyAssessed (featured officer)', () => {
  it('counts 9 of 10 scored in cycle-4', () => {
    expect(getOfficerAssessedCount(FEATURED_OFFICER_ID, 'cycle-4')).toBe(9)
    expect(isOfficerFullyAssessed(FEATURED_OFFICER_ID, 'cycle-4')).toBe(false)
  })

  it('counts all 10 scored in cycle-3', () => {
    expect(getOfficerAssessedCount(FEATURED_OFFICER_ID, 'cycle-3')).toBe(10)
    expect(isOfficerFullyAssessed(FEATURED_OFFICER_ID, 'cycle-3')).toBe(true)
  })
})

describe('getOfficerDomainScore (featured officer, cycle-4)', () => {
  it('flags governance as partial (digital_service is insufficient this cycle)', () => {
    const result = getOfficerDomainScore(FEATURED_OFFICER_ID, 'governance', 'cycle-4')
    expect(result).toEqual({ score: 66, confidence: 'partial' })
  })

  it('flags behavioural as fully scored', () => {
    const result = getOfficerDomainScore(FEATURED_OFFICER_ID, 'behavioural', 'cycle-4')
    expect(result).toEqual({ score: 72, confidence: 'scored' })
  })

  it('flags statistical as fully scored', () => {
    const result = getOfficerDomainScore(FEATURED_OFFICER_ID, 'statistical', 'cycle-4')
    expect(result).toEqual({ score: 70, confidence: 'scored' })
  })
})

describe('getPreviousCycleId', () => {
  it('returns the cycle before the current one', () => {
    expect(getPreviousCycleId(CURRENT_CYCLE_ID)).toBe('cycle-3')
  })

  it('returns null for the first cycle', () => {
    expect(getPreviousCycleId('cycle-1')).toBeNull()
  })
})

describe('getOfficerWeakestCompetencies (featured officer, cycle-4)', () => {
  it('returns the two lowest-scoring competencies, ascending', () => {
    const result = getOfficerWeakestCompetencies(FEATURED_OFFICER_ID, 'cycle-4', 2)
    expect(result.map((r) => r.competency.id)).toEqual(['data_automation', 'computation'])
    expect(result.map((r) => r.score)).toEqual([52, 57])
  })
})

describe('getOfficerEngagement', () => {
  it('returns the featured officer\'s hand-authored engagement for cycle-4', () => {
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-4')).toEqual({
      learningHours: 22,
      coursesCompleted: 4,
    })
  })

  it('returns zeros for an officer/cycle with no recorded engagement', () => {
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-1')).toEqual({
      learningHours: 0,
      coursesCompleted: 0,
    })
  })
})

describe('generated officers (deterministic, non-featured)', () => {
  const otherOfficerId = officers.find((o) => o.id !== FEATURED_OFFICER_ID)!.id

  it('is deterministic across repeated calls', () => {
    const first = getOfficerOverallScore(otherOfficerId, CURRENT_CYCLE_ID)
    const second = getOfficerOverallScore(otherOfficerId, CURRENT_CYCLE_ID)
    expect(first).toBe(second)
  })

  it('keeps every scored value within the valid 15-97 range', () => {
    for (const officer of officers) {
      if (officer.id === FEATURED_OFFICER_ID) continue
      for (const cycle of assessmentCycles) {
        for (const competency of taxonomyCompetencies) {
          const entry = getRawScore(officer.id, cycle.id, competency.id)
          if (entry.confidence === 'scored') {
            expect(entry.score).toBeGreaterThanOrEqual(15)
            expect(entry.score).toBeLessThanOrEqual(97)
          }
        }
      }
    }
  })
})

describe('getOfficerEngagement (generated officers)', () => {
  it("does not change the featured officer's existing hand-authored values", () => {
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-3')).toEqual({
      learningHours: 14,
      coursesCompleted: 2,
    })
    expect(getOfficerEngagement(FEATURED_OFFICER_ID, 'cycle-4')).toEqual({
      learningHours: 22,
      coursesCompleted: 4,
    })
  })

  it('gives every other officer non-zero engagement at cycle-4, growing from cycle-3', () => {
    officers
      .filter((o) => o.id !== FEATURED_OFFICER_ID)
      .forEach((officer) => {
        const c3 = getOfficerEngagement(officer.id, 'cycle-3')
        const c4 = getOfficerEngagement(officer.id, 'cycle-4')
        expect(c4.learningHours).toBeGreaterThan(0)
        expect(c4.learningHours).toBeGreaterThanOrEqual(c3.learningHours)
        expect(c4.coursesCompleted).toBeGreaterThanOrEqual(c3.coursesCompleted)
      })
  })

  it('is deterministic across repeated calls', () => {
    const first = getOfficerEngagement('ananya-krishnan', 'cycle-4')
    const second = getOfficerEngagement('ananya-krishnan', 'cycle-4')
    expect(first).toEqual(second)
  })
})

describe('getOfficerExpertise', () => {
  it("returns the featured officer's strongest domain at cycle-4 (behavioural, from stakeholder_comm 79 / ethical_ai 64 averaging 72, the highest of the 4 domains)", () => {
    const result = getOfficerExpertise(FEATURED_OFFICER_ID, 'cycle-4')
    expect(result).not.toBeNull()
    expect(result?.domain.id).toBe('behavioural')
    expect(result?.score).toBe(72)
  })

  it('returns a non-null result for every officer at cycle-4', () => {
    officers.forEach((officer) => {
      expect(getOfficerExpertise(officer.id, 'cycle-4')).not.toBeNull()
    })
  })
})
