import { useMemo, useState } from 'react'
import { ListChecks, Robot, ShieldWarning, SlidersHorizontal } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import {
  type AuditStatus,
  type RejectionReason,
  type VerificationPass,
  filterAuditItems,
  mockRejectionAuditItems,
  rejectionReasonLabels,
  sourceDocuments,
  verificationPassLabels,
} from '../../data/rejectionAudit'

const columns: { id: AuditStatus; label: string }[] = [
  { id: 'rejected', label: 'Rejected' },
  { id: 'needs_manual_review', label: 'Needs Manual Review' },
  { id: 'verified', label: 'Verified' },
  { id: 'flagged', label: 'Flagged' },
]

const reasonTagClass: Record<Exclude<RejectionReason, null>, string> = {
  failed_span_match: 'bg-primary-tint text-primary',
  failed_semantic_support: 'bg-accent-tint text-accent',
  low_confidence: 'border border-border-strong text-text-secondary',
}

// Icons, not human avatars: these mark which automated pipeline stage caught the issue,
// and a fake human avatar would misrepresent an automated step (spec §6).
const passIcon: Record<VerificationPass, Icon> = {
  first_pass_llm: Robot,
  deterministic_check: ListChecks,
  second_pass_adversarial: ShieldWarning,
}

export function RejectionAuditBoard() {
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [reasonFilter, setReasonFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return filterAuditItems(mockRejectionAuditItems, {
      sourceDocument: sourceFilter === 'all' ? undefined : sourceFilter,
      rejectionReason: reasonFilter === 'all' ? undefined : (reasonFilter as RejectionReason),
    })
  }, [sourceFilter, reasonFilter])

  const hasActiveFilters = sourceFilter !== 'all' || reasonFilter !== 'all'
  const reasonKeys = Object.keys(rejectionReasonLabels) as Exclude<RejectionReason, null>[]

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-caption text-text-secondary">
          <SlidersHorizontal size={14} />
          Filter
        </span>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All source documents</option>
          {sourceDocuments.map((doc) => (
            <option key={doc} value={doc}>
              {doc}
            </option>
          ))}
        </select>
        <select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          className="rounded-sm border border-border bg-surface px-3 py-1.5 text-caption text-text-primary"
        >
          <option value="all">All rejection reasons</option>
          {reasonKeys.map((reason) => (
            <option key={reason} value={reason}>
              {rejectionReasonLabels[reason]}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSourceFilter('all')
              setReasonFilter('all')
            }}
            className="text-caption font-medium text-primary hover:text-primary-hover"
          >
            Reset filters
          </button>
        )}
        <span className="text-caption text-text-muted">
          {filtered.length} of {mockRejectionAuditItems.length} items
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map((column) => {
          const items = filtered.filter((item) => item.status === column.id)
          return (
            <div key={column.id} className="rounded-sm border border-border bg-surface-alt p-3">
              <div className="flex items-center justify-between px-1 pb-2">
                <p className="text-h3 font-semibold text-text-primary">{column.label}</p>
                <span className="text-micro text-text-muted">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => {
                  const PassIcon = passIcon[item.verificationPass]
                  return (
                    <div key={item.id} className="rounded-sm border border-border bg-surface p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-micro font-medium text-text-muted">{item.questionId}</span>
                        <span title={verificationPassLabels[item.verificationPass]}>
                          <PassIcon size={14} className="text-text-muted" />
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-caption text-text-primary">{item.questionText}</p>
                      <p className="mt-1.5 text-micro text-text-muted">{item.sourceDocument}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {item.rejectionReason && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-micro font-medium ${reasonTagClass[item.rejectionReason]}`}
                          >
                            {rejectionReasonLabels[item.rejectionReason]}
                          </span>
                        )}
                        <span className="text-micro text-text-muted">
                          {new Date(item.reviewedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && (
                  <p className="px-1 py-3 text-center text-caption text-text-muted">
                    No items match the current filters.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
