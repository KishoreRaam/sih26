import { describe, expect, it } from 'vitest'
import { filterAuditItems, mockRejectionAuditItems } from './rejectionAudit'

const VALID_STATUSES = ['rejected', 'needs_manual_review', 'verified', 'flagged']

describe('mockRejectionAuditItems', () => {
  it('has 18 items, each with a valid board status', () => {
    expect(mockRejectionAuditItems).toHaveLength(18)
    mockRejectionAuditItems.forEach((item) => expect(VALID_STATUSES).toContain(item.status))
  })

  it('has unique ids', () => {
    const ids = new Set(mockRejectionAuditItems.map((item) => item.id))
    expect(ids.size).toBe(mockRejectionAuditItems.length)
  })

  it('covers all four board statuses', () => {
    const statuses = new Set(mockRejectionAuditItems.map((item) => item.status))
    expect(statuses).toEqual(new Set(VALID_STATUSES))
  })
})

describe('filterAuditItems', () => {
  it('returns everything when no filters are given', () => {
    expect(filterAuditItems(mockRejectionAuditItems, {})).toHaveLength(mockRejectionAuditItems.length)
  })

  it('filters by source document only', () => {
    const result = filterAuditItems(mockRejectionAuditItems, {
      sourceDocument: 'MoSPI_Data_Quality_Standards_v3.pdf',
    })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.sourceDocument === 'MoSPI_Data_Quality_Standards_v3.pdf')).toBe(true)
  })

  it('filters by rejection reason only', () => {
    const result = filterAuditItems(mockRejectionAuditItems, { rejectionReason: 'low_confidence' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((item) => item.rejectionReason === 'low_confidence')).toBe(true)
  })

  it('combines both filters', () => {
    const result = filterAuditItems(mockRejectionAuditItems, {
      sourceDocument: 'ISS_Reference_Manual_Ch4_Sampling.pdf',
      rejectionReason: 'failed_span_match',
    })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((item) => {
      expect(item.sourceDocument).toBe('ISS_Reference_Manual_Ch4_Sampling.pdf')
      expect(item.rejectionReason).toBe('failed_span_match')
    })
  })
})
