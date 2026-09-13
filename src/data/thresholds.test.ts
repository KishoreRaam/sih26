import { describe, expect, it } from 'vitest'
import { levelFromScore, MODERATE_MIN, STRONG_MIN } from './thresholds'

describe('levelFromScore', () => {
  it('returns strong at and above the strong threshold', () => {
    expect(levelFromScore(STRONG_MIN)).toBe('strong')
    expect(levelFromScore(90)).toBe('strong')
  })

  it('returns moderate between the two thresholds', () => {
    expect(levelFromScore(MODERATE_MIN)).toBe('moderate')
    expect(levelFromScore(STRONG_MIN - 1)).toBe('moderate')
  })

  it('returns weak below the moderate threshold', () => {
    expect(levelFromScore(MODERATE_MIN - 1)).toBe('weak')
    expect(levelFromScore(0)).toBe('weak')
  })
})
