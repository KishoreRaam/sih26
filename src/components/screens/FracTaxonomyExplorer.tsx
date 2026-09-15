import { useState } from 'react'
import { CaretRight, ClipboardText, FileText, Info, UsersThree } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { CURRENT_CYCLE_ID, getCompetencyAssessedCount, getCompetencyScoreSummary } from '../../data/competencyDomains'
import {
  FRAC_TAXONOMY_IS_PLACEHOLDER,
  fracTaxonomy,
  getDocumentNamesForCompetency,
  getDocumentsMappedCount,
  getQuestionsGeneratedCount,
  type FracCompetencyNode,
  type FracDifficulty,
  type FracDomainNode,
  type FracSubdomainNode,
} from '../../data/fracTaxonomy'
import { officers } from '../../data/officers'
import { levelFromScore } from '../../data/thresholds'
import { CompetencyScoreCard } from '../shared/CompetencyScoreCard'
import { FracTagBadge } from '../shared/FracTagBadge'

const difficultyLabel: Record<FracDifficulty, string> = {
  foundational: 'Foundational',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

function IconStat({ icon: StatIcon, value, label }: { icon: Icon; value: string | number; label: string }) {
  return (
    <span className="flex items-center gap-1" title={label}>
      <StatIcon size={13} />
      <span className="tabular-nums">{value}</span>
    </span>
  )
}

function competencyCoverage(competencyIds: string[]) {
  const documentNames = new Set<string>()
  let questions = 0
  let mapped = 0
  for (const id of competencyIds) {
    getDocumentNamesForCompetency(id).forEach((name) => documentNames.add(name))
    questions += getQuestionsGeneratedCount(id)
    if (getDocumentsMappedCount(id) > 0) mapped++
  }
  return { documents: documentNames.size, questions, mapped, total: competencyIds.length }
}

export function FracTaxonomyExplorer() {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set([fracTaxonomy.domains[0]?.id]))
  const [expandedSubdomains, setExpandedSubdomains] = useState<Set<string>>(new Set())
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null)

  function toggleDomain(id: string) {
    setExpandedDomains((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSubdomain(id: string) {
    setExpandedSubdomains((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allCompetencyIds = fracTaxonomy.domains.flatMap((d) => d.subdomains.flatMap((s) => s.competencies.map((c) => c.id)))
  const totalSubdomains = fracTaxonomy.domains.reduce((sum, d) => sum + d.subdomains.length, 0)
  const overall = competencyCoverage(allCompetencyIds)

  return (
    <div>
      <p className="max-w-[68ch] text-h1 font-semibold leading-snug text-text-primary">
        {overall.mapped} of {allCompetencyIds.length} FRAC competencies have at least one mapped source document.
      </p>
      <p className="mt-2 text-caption text-text-secondary">
        {fracTaxonomy.domains.length} domains · {totalSubdomains} subdomains · {allCompetencyIds.length} competencies ·{' '}
        {overall.questions} questions generated from {overall.documents} uploaded document{overall.documents === 1 ? '' : 's'}
      </p>

      {FRAC_TAXONOMY_IS_PLACEHOLDER && (
        <p className="mt-3 flex items-start gap-1.5 rounded-sm border border-dashed border-border bg-surface-alt px-3 py-2 text-caption text-text-muted">
          <Info size={14} className="mt-0.5 shrink-0" />
          Subdomain grouping and difficulty ratings below are illustrative, pending the real DoPT FRAC
          document-to-competency mapping. The four domain names and ten competencies are the real taxonomy already
          used for assessment.
        </p>
      )}

      <div className="mt-6 divide-y divide-border rounded-sm border border-border">
        {fracTaxonomy.domains.map((domain) => (
          <DomainRow
            key={domain.id}
            domain={domain}
            expanded={expandedDomains.has(domain.id)}
            onToggle={() => toggleDomain(domain.id)}
            expandedSubdomains={expandedSubdomains}
            onToggleSubdomain={toggleSubdomain}
            selectedCompetencyId={selectedCompetencyId}
            onSelectCompetency={(id) => setSelectedCompetencyId((prev) => (prev === id ? null : id))}
          />
        ))}
      </div>
    </div>
  )
}

interface DomainRowProps {
  domain: FracDomainNode
  expanded: boolean
  onToggle: () => void
  expandedSubdomains: Set<string>
  onToggleSubdomain: (id: string) => void
  selectedCompetencyId: string | null
  onSelectCompetency: (id: string) => void
}

function DomainRow({
  domain,
  expanded,
  onToggle,
  expandedSubdomains,
  onToggleSubdomain,
  selectedCompetencyId,
  onSelectCompetency,
}: DomainRowProps) {
  const competencyIds = domain.subdomains.flatMap((s) => s.competencies.map((c) => c.id))
  const coverage = competencyCoverage(competencyIds)

  return (
    <div className="bg-surface">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-alt"
      >
        <CaretRight size={13} className={`shrink-0 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`} />
        <FracTagBadge domain={domain.id} />
        <span className="text-caption text-text-muted">
          {domain.subdomains.length} subdomains · {competencyIds.length} competencies
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-3 text-caption text-text-secondary">
          <span className="rounded-full border border-border bg-surface-alt px-2 py-0.5 text-micro font-medium tabular-nums text-text-primary">
            {coverage.mapped}/{coverage.total} mapped
          </span>
          <IconStat icon={ClipboardText} value={coverage.questions} label="questions generated" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border bg-bg pl-6">
          {domain.subdomains.map((subdomain) => (
            <SubdomainRow
              key={subdomain.id}
              domain={domain}
              subdomain={subdomain}
              expanded={expandedSubdomains.has(subdomain.id)}
              onToggle={() => onToggleSubdomain(subdomain.id)}
              selectedCompetencyId={selectedCompetencyId}
              onSelectCompetency={onSelectCompetency}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SubdomainRowProps {
  domain: FracDomainNode
  subdomain: FracSubdomainNode
  expanded: boolean
  onToggle: () => void
  selectedCompetencyId: string | null
  onSelectCompetency: (id: string) => void
}

function SubdomainRow({ domain, subdomain, expanded, onToggle, selectedCompetencyId, onSelectCompetency }: SubdomainRowProps) {
  const competencyIds = subdomain.competencies.map((c) => c.id)
  const coverage = competencyCoverage(competencyIds)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 py-2.5 pr-4 text-left transition-colors hover:bg-surface-alt"
      >
        <CaretRight size={11} className={`shrink-0 text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`} />
        <span className="text-body font-medium text-text-primary">{subdomain.name}</span>
        <span className="ml-auto flex shrink-0 items-center gap-3 text-caption text-text-muted">
          <span className="tabular-nums">{coverage.mapped}/{coverage.total} mapped</span>
          <IconStat icon={ClipboardText} value={coverage.questions} label="questions generated" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border pl-6">
          {subdomain.competencies.map((competency) => (
            <CompetencyRow
              key={competency.id}
              domain={domain}
              competency={competency}
              selected={selectedCompetencyId === competency.id}
              onSelect={() => onSelectCompetency(competency.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CompetencyRowProps {
  domain: FracDomainNode
  competency: FracCompetencyNode
  selected: boolean
  onSelect: () => void
}

function CompetencyRow({ domain, competency, selected, onSelect }: CompetencyRowProps) {
  const documentsMapped = getDocumentsMappedCount(competency.id)
  const questionsGenerated = getQuestionsGeneratedCount(competency.id)
  const officersAssessed = getCompetencyAssessedCount(competency.id, CURRENT_CYCLE_ID)
  const summary = getCompetencyScoreSummary(competency.id, CURRENT_CYCLE_ID)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={selected}
        className="flex w-full items-center gap-2.5 py-2.5 pr-4 text-left transition-colors hover:bg-surface-alt"
      >
        <CaretRight size={10} className={`shrink-0 text-text-muted transition-transform ${selected ? 'rotate-90' : ''}`} />
        <span className="text-caption text-text-primary">{competency.name}</span>
        <span className="shrink-0 rounded-full border border-border bg-surface-alt px-2 py-0.5 text-micro font-medium text-text-secondary">
          {difficultyLabel[competency.difficulty]}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-3 text-micro text-text-muted">
          <IconStat icon={FileText} value={documentsMapped} label="documents mapped" />
          <IconStat icon={ClipboardText} value={questionsGenerated} label="questions generated" />
          <IconStat icon={UsersThree} value={`${officersAssessed}/${officers.length}`} label="officers assessed" />
        </span>
      </button>

      {selected && (
        <div className="pb-3 pr-4">
          <CompetencyScoreCard
            domain={domain.id}
            score={summary.score ?? 0}
            sampleSize={questionsGenerated}
            confidenceBandLower={summary.lower ?? 0}
            confidenceBandUpper={summary.upper ?? 0}
            status={summary.score !== null ? levelFromScore(summary.score) : 'weak'}
          />
        </div>
      )}
    </div>
  )
}
