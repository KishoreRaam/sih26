// All mock content for the demo lives here so copy can be edited
// without touching component code. Nothing here calls a real API.

export interface NavChildItem {
  id: string
  label: string
}

export interface NavItem {
  id: string
  label: string
  children?: NavChildItem[]
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: 'diagnostics-group',
    label: 'Diagnostics',
    items: [
      { id: 'overview', label: 'Dashboard' },
      {
        id: 'diagnostics',
        label: 'New Assessment',
        children: [
          { id: 'upload', label: 'Upload Material' },
          { id: 'generate', label: 'Generate Questions' },
          { id: 'quiz', label: 'Assessment' },
          { id: 'dashboard', label: 'Competency Report' },
          { id: 'recommendations', label: 'Recommendations' },
        ],
      },
      { id: 'officers', label: 'Officers' },
      { id: 'reports', label: 'Reports' },
    ],
  },
  {
    id: 'governance-group',
    label: 'Quality & Governance',
    items: [
      { id: 'audit', label: 'Verification Audit' },
      { id: 'settings', label: 'Settings' },
    ],
  },
]

export const org = {
  ministry: 'MoSPI',
  division: 'NSSTA',
  productName: 'AI Competency Diagnostics',
}

export const session = {
  name: 'Divya Prakash',
  role: 'Training Coordinator, NSSTA',
}

export type Step = 'upload' | 'generate' | 'quiz' | 'dashboard' | 'recommendations'

export const breadcrumbByStep: Record<Step, string[]> = {
  upload: ['Diagnostics', 'New assessment', 'Upload material'],
  generate: ['Diagnostics', 'New assessment', 'Generate questions'],
  quiz: ['Diagnostics', 'New assessment', 'Assessment'],
  dashboard: ['Diagnostics', 'New assessment', 'Competency report'],
  recommendations: ['Diagnostics', 'New assessment', 'Recommendations'],
}

export const stepCopy: Record<Step, { title: string; subtitle: string }> = {
  upload: {
    title: 'New competency assessment',
    subtitle:
      'Upload NSSTA reference material to generate a diagnostic quiz and produce a competency report for this cohort.',
  },
  generate: {
    title: 'Generating diagnostic questions',
    subtitle: 'Reviewing the uploaded material and drafting questions grounded in its content.',
  },
  quiz: {
    title: 'Assessment',
    subtitle: 'Answer each question. Every question links back to the source material it was drawn from.',
  },
  dashboard: {
    title: 'Competency report',
    subtitle: 'Results for this cohort across each AI competency dimension.',
  },
  recommendations: {
    title: 'Recommended training',
    subtitle: 'iGOT courses targeted at this cohort\'s weakest competency areas.',
  },
}

export const mockUpload = {
  fileName: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
  fileSize: '4.2 MB',
  uploadDurationMs: 1800,
}

export const mockGeneration = {
  durationMs: 4000,
  generated: 127,
  verified: 118,
  rejected: 9,
  rejectedSample: [
    {
      id: 'q84',
      reason:
        'Question 84: duplicate of an already-generated question on stratified sampling error.',
    },
    {
      id: 'q112',
      reason: 'Question 112: answer key contradicts the source passage on page 22.',
    },
    {
      id: 'q63',
      reason:
        'Question 63: no single correct option could be verified against the reference material.',
    },
  ],
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  topic: string
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  source: {
    citation: string
    snippet: string
  }
}

export const mockQuiz: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Sampling methodology',
    prompt:
      'In a stratified random sampling design, allocating a larger share of the sample to strata with higher internal variability, for a fixed total sample size, is known as:',
    options: [
      { id: 'a', text: 'Proportional allocation' },
      { id: 'b', text: 'Neyman (optimal) allocation' },
      { id: 'c', text: 'Equal allocation' },
      { id: 'd', text: 'Cluster allocation' },
    ],
    correctOptionId: 'b',
    source: {
      citation: 'Source: page 14, para 3',
      snippet:
        'Neyman allocation minimizes the variance of the stratified mean estimator for a fixed total sample size by assigning larger sub-samples to strata with greater internal standard deviation, in addition to their size.',
    },
  },
  {
    id: 'q2',
    topic: 'Survey design',
    prompt:
      'Under standard NSS practice, what recall period is used for measuring household consumption of frequently purchased items such as food and personal care?',
    options: [
      { id: 'a', text: '7 days' },
      { id: 'b', text: '30 days' },
      { id: 'c', text: '90 days' },
      { id: 'd', text: '365 days' },
    ],
    correctOptionId: 'a',
    source: {
      citation: 'Source: page 22, para 1',
      snippet:
        'A 7-day recall period is used for frequently purchased items to limit recall decay, while a 30-day period is retained for less frequent purchases and a 365-day period for durable goods and low-frequency expenditure.',
    },
  },
  {
    id: 'q3',
    topic: 'Data quality standards',
    prompt: 'Which of the following is NOT one of the UN Fundamental Principles of Official Statistics?',
    options: [
      { id: 'a', text: 'Relevance, impartiality and equal access' },
      { id: 'b', text: 'Professional standards, scientific principles and ethics' },
      { id: 'c', text: 'Prevention of misuse of statistics' },
      { id: 'd', text: 'Real-time public dashboards for every indicator' },
    ],
    correctOptionId: 'd',
    source: {
      citation: 'Source: page 8, para 2',
      snippet:
        'The ten Fundamental Principles, adopted by the UN Statistical Commission in 1994 and endorsed by the UN General Assembly in 2014, cover relevance and impartiality, professional standards, accountability, prevention of misuse, cost-effectiveness, confidentiality, legislation, national coordination, use of international standards, and international cooperation. Dashboard cadence is an implementation choice, not a Fundamental Principle.',
    },
  },
  {
    id: 'q4',
    topic: 'Statistical computation',
    prompt:
      'A simple random sample of n = 400 households yields a sample standard deviation of 25. What is the approximate standard error of the sample mean?',
    options: [
      { id: 'a', text: '0.0625' },
      { id: 'b', text: '1.25' },
      { id: 'c', text: '1.5' },
      { id: 'd', text: '6.25' },
    ],
    correctOptionId: 'b',
    source: {
      citation: 'Source: page 31, para 4',
      snippet: 'Standard error of the mean is computed as SE = s / sqrt(n). With s = 25 and n = 400, SE = 25 / 20 = 1.25.',
    },
  },
]

export type CompetencyLevel = 'strong' | 'moderate' | 'weak' | 'insufficient'

export interface CompetencyDimension {
  id: string
  label: string
}

export interface CompetencyCell {
  level: CompetencyLevel
  score: number | null
}

export interface OfficerRow {
  id: string
  name: string
  cells: Record<string, CompetencyCell>
}

export const competencyDimensions: CompetencyDimension[] = [
  { id: 'sampling', label: 'Sampling methodology' },
  { id: 'survey', label: 'Survey design' },
  { id: 'quality', label: 'Data quality standards' },
  { id: 'computation', label: 'Statistical computation' },
]

export const mockCompetencyMatrix: OfficerRow[] = [
  {
    id: 'o1',
    name: 'Arvind Subramaniam',
    cells: {
      sampling: { level: 'strong', score: 88 },
      survey: { level: 'strong', score: 79 },
      quality: { level: 'moderate', score: 61 },
      computation: { level: 'weak', score: 38 },
    },
  },
  {
    id: 'o2',
    name: 'Priya Nair',
    cells: {
      sampling: { level: 'strong', score: 91 },
      survey: { level: 'moderate', score: 68 },
      quality: { level: 'strong', score: 85 },
      computation: { level: 'moderate', score: 57 },
    },
  },
  {
    id: 'o3',
    name: 'Sandeep Rathore',
    cells: {
      sampling: { level: 'moderate', score: 63 },
      survey: { level: 'weak', score: 42 },
      quality: { level: 'moderate', score: 58 },
      computation: { level: 'weak', score: 33 },
    },
  },
  {
    id: 'o4',
    name: 'Meenakshi Iyer',
    cells: {
      sampling: { level: 'strong', score: 94 },
      survey: { level: 'strong', score: 87 },
      quality: { level: 'strong', score: 90 },
      computation: { level: 'moderate', score: 60 },
    },
  },
  {
    id: 'o5',
    name: 'Farhan Sheikh',
    cells: {
      sampling: { level: 'moderate', score: 66 },
      survey: { level: 'moderate', score: 59 },
      quality: { level: 'insufficient', score: null },
      computation: { level: 'weak', score: 29 },
    },
  },
  {
    id: 'o6',
    name: 'Kavita Bhatt',
    cells: {
      sampling: { level: 'strong', score: 85 },
      survey: { level: 'moderate', score: 71 },
      quality: { level: 'moderate', score: 67 },
      computation: { level: 'strong', score: 76 },
    },
  },
  {
    id: 'o7',
    name: 'Rajesh Oberoi',
    cells: {
      sampling: { level: 'weak', score: 47 },
      survey: { level: 'weak', score: 39 },
      quality: { level: 'weak', score: 44 },
      computation: { level: 'weak', score: 22 },
    },
  },
  {
    id: 'o8',
    name: 'Anjali Deshmukh',
    cells: {
      sampling: { level: 'strong', score: 89 },
      survey: { level: 'strong', score: 83 },
      quality: { level: 'moderate', score: 65 },
      computation: { level: 'moderate', score: 58 },
    },
  },
]

export function getWeakestDimension(): CompetencyDimension {
  let weakest = competencyDimensions[0]
  let weakestAverage = Infinity

  for (const dimension of competencyDimensions) {
    const scores = mockCompetencyMatrix
      .map((officer) => officer.cells[dimension.id].score)
      .filter((score): score is number => score !== null)
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length

    if (average < weakestAverage) {
      weakestAverage = average
      weakest = dimension
    }
  }

  return weakest
}

export function getStrongestDimension(): CompetencyDimension {
  let strongest = competencyDimensions[0]
  let strongestAverage = -Infinity

  for (const dimension of competencyDimensions) {
    const scores = mockCompetencyMatrix
      .map((officer) => officer.cells[dimension.id].score)
      .filter((score): score is number => score !== null)
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length

    if (average > strongestAverage) {
      strongestAverage = average
      strongest = dimension
    }
  }

  return strongest
}

export function getDimensionAverage(dimensionId: string): number {
  const scores = mockCompetencyMatrix
    .map((officer) => officer.cells[dimensionId]?.score)
    .filter((score): score is number => score !== null && score !== undefined)
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

export function getOverallAverage(): number {
  const scores = mockCompetencyMatrix
    .flatMap((officer) => competencyDimensions.map((dimension) => officer.cells[dimension.id].score))
    .filter((score): score is number => score !== null)
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

export function getOfficersAtLevel(dimensionId: string, level: CompetencyLevel): string[] {
  return mockCompetencyMatrix
    .filter((officer) => officer.cells[dimensionId]?.level === level)
    .map((officer) => officer.name)
}

export interface CourseRecommendation {
  title: string
  provider: string
  format: string
}

export const mockCourseCatalog: CourseRecommendation[] = [
  {
    title: 'Applied Statistical Computing for Official Statistics',
    provider: 'iGOT Karmayogi',
    format: '6 hours · Self-paced',
  },
  {
    title: 'R for NSS Unit-Level Data Analysis',
    provider: 'iGOT Karmayogi',
    format: '4 hours · Self-paced',
  },
  {
    title: 'Foundations of Estimation Theory and Sampling Variance',
    provider: 'iGOT Karmayogi',
    format: '8 hours · Instructor-led',
  },
]

export const sectionCopy: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard',
    subtitle: 'Department-level competency progress across the organisation.',
  },
  officers: {
    title: 'Officers',
    subtitle: 'Officers in the current cohort and their overall competency score.',
  },
  reports: {
    title: 'Reports',
    subtitle: 'Competency reports generated for this cohort.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Your NSSTA account details.',
  },
  audit: {
    title: 'Verification Audit',
    subtitle:
      'Question-generation verification outcomes for this cohort, reviewable by source document and rejection reason.',
  },
}

export const breadcrumbBySection: Record<string, string[]> = {
  overview: ['Dashboard'],
  officers: ['Officers'],
  reports: ['Reports'],
  settings: ['Settings'],
  audit: ['Verification Audit'],
}

export function getOfficerAverage(officer: OfficerRow): number {
  const scores = competencyDimensions
    .map((dimension) => officer.cells[dimension.id]?.score)
    .filter((score): score is number => score !== null && score !== undefined)
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}
