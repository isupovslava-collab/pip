import type { CoverRecoveryCandidate } from '../data/coverRecoveryCandidates'

export const COVER_RECOVERY_REVIEW_STORAGE_KEY = 'pipCoverRecoveryReviewV1'
export const COVER_RECOVERY_COMMENT_MAX_LENGTH = 1000

export interface CoverRecoveryReview {
  candidateId: string
  visualQuality: '' | 'strong' | 'medium' | 'weak'
  exactCover: '' | 'yes' | 'no'
  wouldUseAsInspiration: '' | 'yes' | 'no'
  decision: '' | 'approve' | 'revise' | 'reject'
  comment: string
  reviewedAt: string
}

export function emptyCoverRecoveryReview(candidateId: string): CoverRecoveryReview {
  return { candidateId, visualQuality: '', exactCover: '', wouldUseAsInspiration: '', decision: '', comment: '', reviewedAt: '' }
}

export function readCoverRecoveryReviews(storage: Storage = localStorage): Record<string, CoverRecoveryReview> {
  try {
    const value: unknown = JSON.parse(storage.getItem(COVER_RECOVERY_REVIEW_STORAGE_KEY) ?? '{}')
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return value as Record<string, CoverRecoveryReview>
  } catch {
    return {}
  }
}

export function writeCoverRecoveryReviews(reviews: Record<string, CoverRecoveryReview>, storage: Storage = localStorage): void {
  storage.setItem(COVER_RECOVERY_REVIEW_STORAGE_KEY, JSON.stringify(reviews))
}

export function createCoverRecoveryReviewExport(candidates: CoverRecoveryCandidate[], reviews: Record<string, CoverRecoveryReview>, exportedAt = new Date().toISOString()) {
  return {
    schemaVersion: 2,
    reviewRound: 2,
    exportedAt,
    productionApplied: false,
    reviews: candidates.map((candidate) => ({
      ...emptyCoverRecoveryReview(candidate.id),
      ...reviews[candidate.id],
      candidateId: candidate.id,
      title: candidate.title,
      origin: candidate.origin,
      sourceOrigin: candidate.sourceOrigin,
      visualFamily: candidate.visualFamily,
      visualDirection: candidate.visualDirection,
      compositionFamily: candidate.compositionFamily,
      parentCandidateId: candidate.parentCandidateId,
      revisionRound: candidate.revisionRound,
      revisionReason: candidate.revisionReason,
      poFeedbackApplied: candidate.poFeedbackApplied,
      rationale: candidate.rationale,
      reviewStatus: candidate.reviewStatus,
      productionExposure: candidate.productionExposure,
      comment: (reviews[candidate.id]?.comment ?? '').trim().slice(0, COVER_RECOVERY_COMMENT_MAX_LENGTH),
    })),
  }
}
