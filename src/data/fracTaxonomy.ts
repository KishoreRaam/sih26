import { mockGeneration, mockUpload } from '../mockData'
import { domains, taxonomyCompetencies, type DomainId } from './competencyDomains'

/**
 * PLACEHOLDER DATA pending Prakash's real DoPT FRAC document-to-competency mapping.
 *
 * No document-to-FRAC mapping file (document, topic, frac_domain, frac_subdomain,
 * frac_competency, difficulty) exists anywhere in this repo yet — this app's only
 * FRAC data is the flat domain/competency list in ./competencyDomains, which has no
 * subdomain layer and no difficulty rating.
 *
 * The four domains and ten leaf competencies below ARE the real, already-assessed
 * taxonomy used throughout the app. The SUBDOMAIN_GROUPS grouping and each
 * competency's `difficulty` are illustrative only, invented for this explorer so the
 * tree has three levels to navigate — replace both once Prakash's real mapping lands.
 */
export const FRAC_TAXONOMY_IS_PLACEHOLDER = true as const

export type FracDifficulty = 'foundational' | 'intermediate' | 'advanced'

export interface FracCompetencyNode {
  id: string
  name: string
  difficulty: FracDifficulty
}

export interface FracSubdomainNode {
  id: string
  name: string
  competencies: FracCompetencyNode[]
}

export interface FracDomainNode {
  id: DomainId
  name: string
  subdomains: FracSubdomainNode[]
}

const SUBDOMAIN_GROUPS: Record<DomainId, { id: string; name: string; competencyIds: string[] }[]> = {
  statistical: [
    { id: 'stat-sampling-survey', name: 'Sampling & Survey Methodology', competencyIds: ['sampling', 'survey'] },
    { id: 'stat-quality-computation', name: 'Data Quality & Computation', competencyIds: ['quality', 'computation'] },
  ],
  technical: [
    { id: 'tech-ai-foundations', name: 'AI/ML Foundations', competencyIds: ['ai_fundamentals'] },
    { id: 'tech-automation', name: 'Automation & Tooling', competencyIds: ['data_automation'] },
  ],
  governance: [
    { id: 'gov-privacy-security', name: 'Data Privacy & Security', competencyIds: ['data_privacy'] },
    { id: 'gov-service-standards', name: 'Digital Service Standards', competencyIds: ['digital_service'] },
  ],
  behavioural: [
    { id: 'beh-communication', name: 'Communication & Stakeholder Management', competencyIds: ['stakeholder_comm'] },
    { id: 'beh-ethics', name: 'Ethics & Judgement', competencyIds: ['ethical_ai'] },
  ],
}

const COMPETENCY_DIFFICULTY: Record<string, FracDifficulty> = {
  sampling: 'intermediate',
  survey: 'foundational',
  quality: 'foundational',
  computation: 'advanced',
  ai_fundamentals: 'foundational',
  data_automation: 'intermediate',
  data_privacy: 'intermediate',
  digital_service: 'foundational',
  stakeholder_comm: 'foundational',
  ethical_ai: 'advanced',
}

export const fracTaxonomy: { domains: FracDomainNode[] } = {
  domains: domains.map((domain) => ({
    id: domain.id,
    name: domain.name,
    subdomains: SUBDOMAIN_GROUPS[domain.id].map((group) => ({
      id: group.id,
      name: group.name,
      competencies: group.competencyIds.map((competencyId) => {
        const competency = taxonomyCompetencies.find((c) => c.id === competencyId)!
        return { id: competency.id, name: competency.label, difficulty: COMPETENCY_DIFFICULTY[competency.id] }
      }),
    })),
  })),
}

// --- Live coverage counts ---------------------------------------------------------
// "Documents mapped" and "questions generated" reflect the single reference document
// uploaded in this demo cycle (mockUpload / mockGeneration in ../mockData). Only the
// four Statistical competencies whose topics match that document's generated question
// set have any coverage yet - every other competency truthfully has zero, until a
// document is uploaded and mapped for it. "Officers assessed" is separate: it reflects
// the cohort's assessment history to date (getCompetencyAssessedCount in
// ./competencyDomains), which predates this cycle's upload.
const DOCUMENT_MAPPED_COMPETENCY_IDS = ['sampling', 'survey', 'quality', 'computation']

export function getDocumentsMappedCount(competencyId: string): number {
  return DOCUMENT_MAPPED_COMPETENCY_IDS.includes(competencyId) ? 1 : 0
}

export function getDocumentNamesForCompetency(competencyId: string): string[] {
  return DOCUMENT_MAPPED_COMPETENCY_IDS.includes(competencyId) ? [mockUpload.fileName] : []
}

export function getQuestionsGeneratedCount(competencyId: string): number {
  if (!DOCUMENT_MAPPED_COMPETENCY_IDS.includes(competencyId)) return 0
  return Math.round(mockGeneration.verified / DOCUMENT_MAPPED_COMPETENCY_IDS.length)
}
