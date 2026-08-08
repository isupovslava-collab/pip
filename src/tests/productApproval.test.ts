import { describe, expect, it } from 'vitest'
import { pipProductReviews, sourceReferences } from '../data/sourceReferences/source-references'
import { approvedReferenceCoverage, isProductionEligibleSourceReference, productApprovalSummary, validateProductApproval } from '../lib/referenceVerification/productApproval'
import type { SourceReference } from '../types/sourceReference'

describe('PIP product approval gate', () => {
  it('implements the eight Product Owner decisions exactly', () => {
    expect(validateProductApproval(sourceReferences, pipProductReviews)).toEqual([])
    expect(sourceReferences.filter(isProductionEligibleSourceReference).map(({ id }) => id)).toEqual(['SRC-0001', 'SRC-0006'])
    expect(productApprovalSummary(sourceReferences)).toMatchObject({ sourceVerified: 8, pipApproved: 2, pipRejected: 6, awaitingPoReview: 8, approvedOrganizations: 2, approvedPresentations: 2 })
  })

  it('reports approved coverage independently from source verification', () => {
    expect(approvedReferenceCoverage(sourceReferences).map(({ contentTypeId, sourceVerifiedCount, pipApprovedCount }) => ({ contentTypeId, sourceVerifiedCount, pipApprovedCount }))).toEqual([
      { contentTypeId: 'kpi', sourceVerifiedCount: 1, pipApprovedCount: 0 },
      { contentTypeId: 'comparison', sourceVerifiedCount: 1, pipApprovedCount: 1 },
      { contentTypeId: 'timeline', sourceVerifiedCount: 1, pipApprovedCount: 0 },
      { contentTypeId: 'process', sourceVerifiedCount: 1, pipApprovedCount: 0 },
      { contentTypeId: 'dashboard', sourceVerifiedCount: 1, pipApprovedCount: 0 },
      { contentTypeId: 'cover', sourceVerifiedCount: 1, pipApprovedCount: 1 },
      { contentTypeId: 'story', sourceVerifiedCount: 1, pipApprovedCount: 0 },
      { contentTypeId: 'table', sourceVerifiedCount: 1, pipApprovedCount: 0 },
    ])
  })

  it('requires both gates for production eligibility', () => {
    expect(isProductionEligibleSourceReference({ ...sourceReferences[8], pipProductReviewStatus: 'pip_approved' })).toBe(false)
    expect(isProductionEligibleSourceReference({ ...sourceReferences[0], pipProductReviewStatus: 'awaiting_po_review' })).toBe(false)
  })

  it('records the corrected OGL rights classification for SRC-0004', () => {
    const source = sourceReferences.find(({ id }) => id === 'SRC-0004')!
    expect(source).toMatchObject({ rightsStatus: 'other-open-licence', licenseName: 'Open Government Licence v3.0', displayMode: 'source-link-only' })
    expect(source.rightsEvidenceUrl).toBe('https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/')
  })

  it('rejects invalid approved and rejected product records', () => {
    const invalidSource: SourceReference = { ...sourceReferences[8], pipProductReviewStatus: 'pip_approved' }
    const invalidReview = { ...pipProductReviews[1], sourceReferenceId: invalidSource.id, pipProductReviewStatus: 'pip_rejected' as const, rejectionReasons: [] }
    const errors = validateProductApproval([invalidSource], [invalidReview])
    expect(errors.some((error) => error.includes('statuses differ'))).toBe(true)
    expect(errors.some((error) => error.includes('requires a rejection reason'))).toBe(true)
  })
})
