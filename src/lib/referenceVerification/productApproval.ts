import { contentTypeIds, type ContentTypeId } from '../../types/reference.ts'
import type { PipProductReview, SourceReference } from '../../types/sourceReference'

export function isProductionEligibleSourceReference(reference: SourceReference): boolean {
  return reference.sourceVerificationStatus === 'source_verified' && reference.pipProductReviewStatus === 'pip_approved'
}

export interface ApprovedCoverageRow {
  contentTypeId: ContentTypeId
  sourceVerifiedCount: number
  pipApprovedCount: number
  approvedGapToTarget3: number
}

export function approvedReferenceCoverage(sources: SourceReference[]): ApprovedCoverageRow[] {
  return contentTypeIds.map((contentTypeId) => {
    const matching = sources.filter((source) => source.primaryContentTypeId === contentTypeId)
    const sourceVerifiedCount = matching.filter(({ sourceVerificationStatus }) => sourceVerificationStatus === 'source_verified').length
    const pipApprovedCount = matching.filter(isProductionEligibleSourceReference).length
    return { contentTypeId, sourceVerifiedCount, pipApprovedCount, approvedGapToTarget3: Math.max(0, 3 - pipApprovedCount) }
  })
}

export function productApprovalSummary(sources: SourceReference[]) {
  const approved = sources.filter(isProductionEligibleSourceReference)
  return {
    sourceVerified: sources.filter(({ sourceVerificationStatus }) => sourceVerificationStatus === 'source_verified').length,
    pipApproved: approved.length,
    pipRejected: sources.filter(({ pipProductReviewStatus }) => pipProductReviewStatus === 'pip_rejected').length,
    awaitingPoReview: sources.filter(({ pipProductReviewStatus }) => pipProductReviewStatus === 'awaiting_po_review').length,
    approvedOrganizations: new Set(approved.map(({ organization }) => organization)).size,
    approvedPresentations: new Set(approved.map(({ organization, presentationTitle }) => `${organization}|${presentationTitle}`)).size,
    coverage: approvedReferenceCoverage(sources),
  }
}

export function validateProductApproval(sources: SourceReference[], reviews: PipProductReview[]): string[] {
  const errors: string[] = []
  const sourceById = new Map(sources.map((source) => [source.id, source]))
  const reviewById = new Map<string, PipProductReview>()

  for (const review of reviews) {
    if (reviewById.has(review.sourceReferenceId)) errors.push(`${review.sourceReferenceId}: duplicate product review.`)
    reviewById.set(review.sourceReferenceId, review)
    const source = sourceById.get(review.sourceReferenceId)
    if (!source) { errors.push(`${review.sourceReferenceId}: product review source is missing.`); continue }
    if (source.pipProductReviewStatus !== review.pipProductReviewStatus) errors.push(`${source.id}: source and product review statuses differ.`)
    if (review.pipProductReviewStatus === 'pip_approved') {
      if (source.sourceVerificationStatus !== 'source_verified') errors.push(`${source.id}: pip_approved requires source_verified.`)
      if (!review.poReviewedAt) errors.push(`${source.id}: pip_approved requires PO review date.`)
      if (review.semanticFit === 'fail') errors.push(`${source.id}: pip_approved cannot fail Semantic Fit.`)
      if (review.visualInspiration === 'fail') errors.push(`${source.id}: pip_approved cannot fail Visual Inspiration.`)
      if (review.screenSuitability === 'fail') errors.push(`${source.id}: pip_approved cannot fail Screen Suitability.`)
    }
    if (review.pipProductReviewStatus === 'pip_rejected' && review.rejectionReasons.length === 0) errors.push(`${source.id}: pip_rejected requires a rejection reason.`)
  }

  for (const source of sources) {
    if (source.pipProductReviewStatus === 'pip_approved' && source.sourceVerificationStatus !== 'source_verified') errors.push(`${source.id}: production eligibility is invalid.`)
    if (source.pipProductReviewStatus !== 'awaiting_po_review' && !reviewById.has(source.id)) errors.push(`${source.id}: decided product status requires a product review.`)
  }

  const expected: Record<string, SourceReference['pipProductReviewStatus']> = {
    'SRC-0001': 'pip_approved', 'SRC-0002': 'pip_rejected', 'SRC-0003': 'pip_rejected', 'SRC-0004': 'pip_rejected',
    'SRC-0005': 'pip_rejected', 'SRC-0006': 'pip_approved', 'SRC-0007': 'pip_rejected', 'SRC-0008': 'pip_rejected',
  }
  for (const [id, status] of Object.entries(expected)) if (sourceById.get(id)?.pipProductReviewStatus !== status) errors.push(`${id}: expected ${status}.`)
  if (sources.filter(isProductionEligibleSourceReference).map(({ id }) => id).sort().join(',') !== 'SRC-0001,SRC-0006') errors.push('Only SRC-0001 and SRC-0006 may be production eligible after PO review.')

  return errors
}
