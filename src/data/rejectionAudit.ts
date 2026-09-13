// MOCK FIXTURE — reconcile with backend rejection-logging schema when available.
// Expected real fields once question verification is backend-logged:
//   id: string
//   questionId: string
//   questionText: string
//   sourceDocument: string
//   status: 'rejected' | 'needs_manual_review' | 'verified' | 'flagged'
//   rejectionReason: 'failed_span_match' | 'failed_semantic_support' | 'low_confidence' | null
//   verificationPass: 'first_pass_llm' | 'deterministic_check' | 'second_pass_adversarial'
//   reviewedAt: string (ISO timestamp)
//   confidenceScore: number | null

export type AuditStatus = 'rejected' | 'needs_manual_review' | 'verified' | 'flagged'
export type RejectionReason = 'failed_span_match' | 'failed_semantic_support' | 'low_confidence' | null
export type VerificationPass = 'first_pass_llm' | 'deterministic_check' | 'second_pass_adversarial'

export interface RejectionAuditItem {
  id: string
  questionId: string
  questionText: string
  sourceDocument: string
  status: AuditStatus
  rejectionReason: RejectionReason
  verificationPass: VerificationPass
  reviewedAt: string
  confidenceScore: number | null
}

export const sourceDocuments = [
  'ISS_Reference_Manual_Ch4_Sampling.pdf',
  'NSS_Survey_Design_Handbook_2025.pdf',
  'MoSPI_Data_Quality_Standards_v3.pdf',
  'NSSTA_AI_Competency_Curriculum_Notes.pdf',
] as const

export const rejectionReasonLabels: Record<Exclude<RejectionReason, null>, string> = {
  failed_span_match: 'Failed span match',
  failed_semantic_support: 'Failed semantic support',
  low_confidence: 'Low confidence',
}

export const verificationPassLabels: Record<VerificationPass, string> = {
  first_pass_llm: 'First-pass LLM',
  deterministic_check: 'Deterministic check',
  second_pass_adversarial: 'Second-pass adversarial review',
}

export const mockRejectionAuditItems: RejectionAuditItem[] = [
  {
    id: 'ra-001',
    questionId: 'q84',
    questionText:
      'In stratified random sampling, allocating a larger share of the sample to strata with higher internal variability is known as which allocation method, and how does it differ from proportional allocation in variance reduction terms?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'rejected',
    rejectionReason: 'failed_span_match',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-10T09:12:00+05:30',
    confidenceScore: 0.41,
  },
  {
    id: 'ra-002',
    questionId: 'q112',
    questionText:
      'Which recall period does standard NSS practice prescribe for measuring household consumption of durable goods, and what is the stated rationale for using a longer window than for frequently purchased items?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'rejected',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-10T09:47:00+05:30',
    confidenceScore: 0.38,
  },
  {
    id: 'ra-003',
    questionId: 'q63',
    questionText:
      'A simple random sample of n households yields a given sample standard deviation; compute the approximate standard error of the mean and identify which formula was applied.',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'rejected',
    rejectionReason: 'low_confidence',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-10T10:03:00+05:30',
    confidenceScore: 0.29,
  },
  {
    id: 'ra-004',
    questionId: 'q147',
    questionText:
      'Which of the UN Fundamental Principles of Official Statistics addresses the prevention of misuse of statistics, and what obligation does it place on producing agencies?',
    sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    status: 'rejected',
    rejectionReason: 'failed_span_match',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-10T10:21:00+05:30',
    confidenceScore: 0.44,
  },
  {
    id: 'ra-005',
    questionId: 'q158',
    questionText:
      'An officer uses a large language model to auto-classify survey responses; which governance safeguard is required before the classifications are published as an official statistic?',
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'rejected',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-10T11:05:00+05:30',
    confidenceScore: 0.35,
  },
  {
    id: 'ra-006',
    questionId: 'q092',
    questionText:
      'Compare Neyman allocation and equal allocation for a stratified design with three strata of unequal variance, and state which minimizes the variance of the estimator.',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'low_confidence',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-11T08:40:00+05:30',
    confidenceScore: 0.54,
  },
  {
    id: 'ra-007',
    questionId: 'q101',
    questionText:
      'What distinguishes a rotating panel design from a fresh cross-sectional sample in successive NSS survey rounds?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-11T09:15:00+05:30',
    confidenceScore: 0.49,
  },
  {
    id: 'ra-008',
    questionId: 'q118',
    questionText:
      'Identify the data quality dimension violated when two administrative sources report conflicting population totals for the same district and period.',
    sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'failed_span_match',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-11T09:58:00+05:30',
    confidenceScore: 0.51,
  },
  {
    id: 'ra-009',
    questionId: 'q133',
    questionText:
      "A training officer wants to explain model confidence scores to a non-technical review committee; which explanation avoids overstating the model's certainty?",
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'low_confidence',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-11T10:32:00+05:30',
    confidenceScore: 0.47,
  },
  {
    id: 'ra-010',
    questionId: 'q140',
    questionText:
      'Given a coefficient-of-variation threshold for publishable estimates, determine whether a district-level estimate with CV of 34% should be released with a caveat or suppressed.',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'needs_manual_review',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-11T11:10:00+05:30',
    confidenceScore: 0.52,
  },
  {
    id: 'ra-011',
    questionId: 'q021',
    questionText:
      'Under standard NSS practice, which recall period is used for frequently purchased items such as food and personal care?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-09T09:00:00+05:30',
    confidenceScore: 0.92,
  },
  {
    id: 'ra-012',
    questionId: 'q033',
    questionText:
      'Which of the ten UN Fundamental Principles of Official Statistics concerns professional standards, scientific principles, and ethics?',
    sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-09T09:45:00+05:30',
    confidenceScore: 0.95,
  },
  {
    id: 'ra-013',
    questionId: 'q048',
    questionText: 'For n = 400 and sample standard deviation 25, what is the standard error of the sample mean?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-09T10:22:00+05:30',
    confidenceScore: 0.97,
  },
  {
    id: 'ra-014',
    questionId: 'q055',
    questionText: 'What safeguard does the NSSTA curriculum require before an AI-drafted question bank is administered to officers?',
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-09T11:03:00+05:30',
    confidenceScore: 0.9,
  },
  {
    id: 'ra-015',
    questionId: 'q067',
    questionText:
      'Which allocation method assigns larger sub-samples to strata with greater internal standard deviation for a fixed total sample size?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'verified',
    rejectionReason: null,
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-09T11:41:00+05:30',
    confidenceScore: 0.94,
  },
  {
    id: 'ra-016',
    questionId: 'q072',
    questionText:
      'A generated question cites page 41 of the source manual, but the manual has only 38 pages; what verification step should have caught this before publication?',
    sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
    status: 'flagged',
    rejectionReason: 'failed_span_match',
    verificationPass: 'second_pass_adversarial',
    reviewedAt: '2026-09-12T08:15:00+05:30',
    confidenceScore: 0.22,
  },
  {
    id: 'ra-017',
    questionId: 'q089',
    questionText:
      'Two generated questions share an identical answer key despite testing different competencies; which pipeline stage should de-duplicate these before officer assignment?',
    sourceDocument: 'NSS_Survey_Design_Handbook_2025.pdf',
    status: 'flagged',
    rejectionReason: 'low_confidence',
    verificationPass: 'deterministic_check',
    reviewedAt: '2026-09-12T08:52:00+05:30',
    confidenceScore: 0.31,
  },
  {
    id: 'ra-018',
    questionId: 'q096',
    questionText:
      'A question about AI model bias references a passage on sampling bias instead; which failure mode does this represent in the source-grounding pipeline?',
    sourceDocument: 'NSSTA_AI_Competency_Curriculum_Notes.pdf',
    status: 'flagged',
    rejectionReason: 'failed_semantic_support',
    verificationPass: 'first_pass_llm',
    reviewedAt: '2026-09-12T09:30:00+05:30',
    confidenceScore: 0.27,
  },
]

export function filterAuditItems(
  items: RejectionAuditItem[],
  filters: { sourceDocument?: string; rejectionReason?: RejectionReason },
): RejectionAuditItem[] {
  return items.filter((item) => {
    if (filters.sourceDocument && item.sourceDocument !== filters.sourceDocument) return false
    if (filters.rejectionReason !== undefined && item.rejectionReason !== filters.rejectionReason) return false
    return true
  })
}
