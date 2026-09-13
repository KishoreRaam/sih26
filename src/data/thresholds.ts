export const STRONG_MIN = 76
export const MODERATE_MIN = 55

export type ScoreLevel = 'strong' | 'moderate' | 'weak'

export function levelFromScore(score: number): ScoreLevel {
  if (score >= STRONG_MIN) return 'strong'
  if (score >= MODERATE_MIN) return 'moderate'
  return 'weak'
}
