import { FEATURED_OFFICER_ID, officers } from './officers'

export type DomainId = 'statistical' | 'technical' | 'governance' | 'behavioural'

export interface Domain {
  id: DomainId
  name: string
  description: string
}

export const domains: Domain[] = [
  {
    id: 'statistical',
    name: 'Statistical Competency',
    description: 'Core survey, sampling, and estimation methodology.',
  },
  {
    id: 'technical',
    name: 'Technical & AI Competency',
    description: 'Applied AI/ML tooling and data automation skills.',
  },
  {
    id: 'governance',
    name: 'Digital Governance',
    description: 'Data privacy, security, and digital service delivery standards.',
  },
  {
    id: 'behavioural',
    name: 'Behavioural Competency',
    description: 'Communication, ethics, and judgement in applying AI to official statistics.',
  },
]

export interface TaxonomyCompetency {
  id: string
  label: string
  domainId: DomainId
}

export const taxonomyCompetencies: TaxonomyCompetency[] = [
  { id: 'sampling', label: 'Sampling methodology', domainId: 'statistical' },
  { id: 'survey', label: 'Survey design', domainId: 'statistical' },
  { id: 'quality', label: 'Data quality standards', domainId: 'statistical' },
  { id: 'computation', label: 'Statistical computation', domainId: 'statistical' },
  { id: 'ai_fundamentals', label: 'AI/ML Fundamentals for Official Statistics', domainId: 'technical' },
  { id: 'data_automation', label: 'Data Automation & Scripting Tools', domainId: 'technical' },
  { id: 'data_privacy', label: 'Data Privacy & Security Standards', domainId: 'governance' },
  { id: 'digital_service', label: 'Digital Service Delivery Standards (GIGW)', domainId: 'governance' },
  { id: 'stakeholder_comm', label: 'Stakeholder Communication & Reporting', domainId: 'behavioural' },
  { id: 'ethical_ai', label: 'Ethical Use of AI in Decision-Making', domainId: 'behavioural' },
]

export interface AssessmentCycle {
  id: string
  label: string
  date: string
}

export const assessmentCycles: AssessmentCycle[] = [
  { id: 'cycle-1', label: 'Cycle 1', date: '2025-03-10' },
  { id: 'cycle-2', label: 'Cycle 2', date: '2025-07-14' },
  { id: 'cycle-3', label: 'Cycle 3', date: '2026-01-19' },
  { id: 'cycle-4', label: 'Cycle 4 (Current)', date: '2026-08-24' },
]

export const CURRENT_CYCLE_ID = assessmentCycles[assessmentCycles.length - 1].id

export type Confidence = 'scored' | 'insufficient'

export interface CompetencyScore {
  score: number | null
  confidence: Confidence
}

type ScoreTable = Record<string, Record<string, Record<string, CompetencyScore>>>

// Hand-authored so the officer dashboard's flagship demo path (Rohit Malhotra) tells a
// deliberate, honest story: steady improvement, one legacy gap that closed (ethical_ai),
// and one gap newly opened this cycle (digital_service) to exercise the "insufficient
// data must be visible" requirement on the default (current-cycle) view.
const ROHIT_SCORES: Record<string, Record<string, CompetencyScore>> = {
  'cycle-1': {
    sampling: { score: 58, confidence: 'scored' },
    survey: { score: 52, confidence: 'scored' },
    quality: { score: 61, confidence: 'scored' },
    computation: { score: 45, confidence: 'scored' },
    ai_fundamentals: { score: 30, confidence: 'scored' },
    data_automation: { score: 25, confidence: 'scored' },
    data_privacy: { score: 48, confidence: 'scored' },
    digital_service: { score: 40, confidence: 'scored' },
    stakeholder_comm: { score: 66, confidence: 'scored' },
    ethical_ai: { score: null, confidence: 'insufficient' },
  },
  'cycle-2': {
    sampling: { score: 64, confidence: 'scored' },
    survey: { score: 57, confidence: 'scored' },
    quality: { score: 65, confidence: 'scored' },
    computation: { score: 48, confidence: 'scored' },
    ai_fundamentals: { score: 41, confidence: 'scored' },
    data_automation: { score: 33, confidence: 'scored' },
    data_privacy: { score: 54, confidence: 'scored' },
    digital_service: { score: 46, confidence: 'scored' },
    stakeholder_comm: { score: 70, confidence: 'scored' },
    ethical_ai: { score: null, confidence: 'insufficient' },
  },
  'cycle-3': {
    sampling: { score: 71, confidence: 'scored' },
    survey: { score: 63, confidence: 'scored' },
    quality: { score: 70, confidence: 'scored' },
    computation: { score: 53, confidence: 'scored' },
    ai_fundamentals: { score: 55, confidence: 'scored' },
    data_automation: { score: 44, confidence: 'scored' },
    data_privacy: { score: 60, confidence: 'scored' },
    digital_service: { score: 53, confidence: 'scored' },
    stakeholder_comm: { score: 74, confidence: 'scored' },
    ethical_ai: { score: 58, confidence: 'scored' },
  },
  'cycle-4': {
    sampling: { score: 78, confidence: 'scored' },
    survey: { score: 69, confidence: 'scored' },
    quality: { score: 74, confidence: 'scored' },
    computation: { score: 57, confidence: 'scored' },
    ai_fundamentals: { score: 68, confidence: 'scored' },
    data_automation: { score: 52, confidence: 'scored' },
    data_privacy: { score: 66, confidence: 'scored' },
    digital_service: { score: null, confidence: 'insufficient' },
    stakeholder_comm: { score: 79, confidence: 'scored' },
    ethical_ai: { score: 64, confidence: 'scored' },
  },
}

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return hash
}

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clampScore(value: number): number {
  return Math.max(15, Math.min(97, Math.round(value)))
}

// Fabricated per-department skill bias so the department cards built in Task 4/12 show
// a believable spread of On Track / At Risk / Critical rather than one flat cluster.
const DEPARTMENT_BIAS: Record<string, number> = {
  fod: 0,
  sdm: -5,
  dpa: 3,
  rtcs: -8,
  dgc: 14,
  qaw: -18,
}

const CYCLE_GROWTH = [0, 6, 12, 18]

function generateOfficerScores(
  officerId: string,
  departmentId: string,
): Record<string, Record<string, CompetencyScore>> {
  const bias = DEPARTMENT_BIAS[departmentId] ?? 0
  const table: Record<string, Record<string, CompetencyScore>> = {}
  assessmentCycles.forEach((cycle) => {
    table[cycle.id] = {}
  })

  const gapRand = mulberry32(hashString(`${officerId}:current-gap`))
  const hasCurrentGap = gapRand() < 0.25
  const currentGapIndex = Math.floor(gapRand() * taxonomyCompetencies.length)

  taxonomyCompetencies.forEach((competency, competencyIndex) => {
    const rand = mulberry32(hashString(`${officerId}:${competency.id}`))
    const base = 35 + rand() * 35 + bias
    const earlyGapChance = rand()

    assessmentCycles.forEach((cycle, cycleIndex) => {
      const isCurrentCycle = cycleIndex === assessmentCycles.length - 1
      const isEarlyGap = cycleIndex < 2 && earlyGapChance < 0.12
      const isCurrentGap = isCurrentCycle && hasCurrentGap && competencyIndex === currentGapIndex

      if (isEarlyGap || isCurrentGap) {
        table[cycle.id][competency.id] = { score: null, confidence: 'insufficient' }
        return
      }

      const score = clampScore(base + CYCLE_GROWTH[cycleIndex] + (rand() - 0.5) * 6)
      table[cycle.id][competency.id] = { score, confidence: 'scored' }
    })
  })

  return table
}

const scoreTable: ScoreTable = {
  [FEATURED_OFFICER_ID]: ROHIT_SCORES,
}

for (const officer of officers) {
  if (officer.id === FEATURED_OFFICER_ID) continue
  scoreTable[officer.id] = generateOfficerScores(officer.id, officer.departmentId)
}

export function getRawScore(officerId: string, cycleId: string, competencyId: string): CompetencyScore {
  return scoreTable[officerId]?.[cycleId]?.[competencyId] ?? { score: null, confidence: 'insufficient' }
}

export function getOfficerOverallScore(officerId: string, cycleId: string): number {
  const cycleScores = scoreTable[officerId]?.[cycleId]
  if (!cycleScores) return 0
  const scored = Object.values(cycleScores).filter(
    (entry): entry is { score: number; confidence: 'scored' } =>
      entry.confidence === 'scored' && entry.score !== null,
  )
  if (scored.length === 0) return 0
  return Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
}

export function getOfficerAssessedCount(officerId: string, cycleId: string): number {
  const cycleScores = scoreTable[officerId]?.[cycleId]
  if (!cycleScores) return 0
  return Object.values(cycleScores).filter((entry) => entry.confidence === 'scored').length
}

export function isOfficerFullyAssessed(officerId: string, cycleId: string): boolean {
  return getOfficerAssessedCount(officerId, cycleId) === taxonomyCompetencies.length
}

export interface DomainScoreSummary {
  score: number | null
  confidence: 'scored' | 'partial' | 'insufficient'
}

export function getOfficerDomainScore(
  officerId: string,
  domainId: DomainId,
  cycleId: string,
): DomainScoreSummary {
  const cycleScores = scoreTable[officerId]?.[cycleId]
  const competencyIds = taxonomyCompetencies.filter((c) => c.domainId === domainId).map((c) => c.id)
  if (!cycleScores) return { score: null, confidence: 'insufficient' }

  const entries = competencyIds.map((id) => cycleScores[id])
  const scored = entries.filter(
    (entry): entry is { score: number; confidence: 'scored' } =>
      entry.confidence === 'scored' && entry.score !== null,
  )

  if (scored.length === 0) return { score: null, confidence: 'insufficient' }

  const avg = Math.round(scored.reduce((sum, entry) => sum + entry.score, 0) / scored.length)
  return { score: avg, confidence: scored.length === entries.length ? 'scored' : 'partial' }
}

export function getPreviousCycleId(cycleId: string): string | null {
  const index = assessmentCycles.findIndex((cycle) => cycle.id === cycleId)
  if (index <= 0) return null
  return assessmentCycles[index - 1].id
}

export interface WeakCompetency {
  competency: TaxonomyCompetency
  score: number
}

export function getOfficerWeakestCompetencies(
  officerId: string,
  cycleId: string,
  count: number,
): WeakCompetency[] {
  const cycleScores = scoreTable[officerId]?.[cycleId] ?? {}
  const scored = taxonomyCompetencies
    .map((competency) => ({ competency, entry: cycleScores[competency.id] }))
    .filter(
      (item): item is { competency: TaxonomyCompetency; entry: { score: number; confidence: 'scored' } } =>
        item.entry?.confidence === 'scored' && item.entry.score !== null,
    )
    .map((item) => ({ competency: item.competency, score: item.entry.score }))

  return scored.sort((a, b) => a.score - b.score).slice(0, count)
}

function generateOfficerEngagement(
  officerId: string,
): Record<string, { learningHours: number; coursesCompleted: number }> {
  const rand = mulberry32(hashString(`${officerId}:engagement`))
  const cycle3Hours = Math.round(6 + rand() * 20)
  const cycle3Courses = Math.round(rand() * 4)
  const cycle4Hours = cycle3Hours + Math.round(4 + rand() * 14)
  const cycle4Courses = cycle3Courses + Math.round(rand() * 3)

  return {
    'cycle-3': { learningHours: cycle3Hours, coursesCompleted: cycle3Courses },
    'cycle-4': { learningHours: cycle4Hours, coursesCompleted: cycle4Courses },
  }
}

const officerEngagement: Record<string, Record<string, { learningHours: number; coursesCompleted: number }>> = {
  [FEATURED_OFFICER_ID]: {
    'cycle-3': { learningHours: 14, coursesCompleted: 2 },
    'cycle-4': { learningHours: 22, coursesCompleted: 4 },
  },
}

for (const officer of officers) {
  if (officer.id === FEATURED_OFFICER_ID) continue
  officerEngagement[officer.id] = generateOfficerEngagement(officer.id)
}

export function getOfficerEngagement(
  officerId: string,
  cycleId: string,
): { learningHours: number; coursesCompleted: number } {
  return officerEngagement[officerId]?.[cycleId] ?? { learningHours: 0, coursesCompleted: 0 }
}

export interface OfficerExpertise {
  domain: Domain
  score: number
}

export function getOfficerExpertise(officerId: string, cycleId: string): OfficerExpertise | null {
  const scored = domains
    .map((domain) => ({ domain, ...getOfficerDomainScore(officerId, domain.id, cycleId) }))
    .filter((entry): entry is { domain: Domain; score: number; confidence: 'scored' | 'partial' } => entry.score !== null)

  if (scored.length === 0) return null

  return scored.reduce((max, entry) => (entry.score > max.score ? entry : max), scored[0])
}
