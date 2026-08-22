import type { ContentTypeId, PoReviewDisposition, Reference } from '../types/reference'

export const CURATED_CORE_REVIEW_STORAGE_KEY = 'pipCuratedCorePoReviewV1'
export const CURATED_CORE_REVIEW_NOTES_MAX_LENGTH = 1000

export type CuratedCoreVisualDecision = 'approve' | 'reject'
export type CuratedCoreContentTypeDecision = 'pending' | 'verified' | 'reclassify' | 'rejected'

export interface CuratedCoreReviewDecision {
  referenceId: string
  visualDecision: CuratedCoreVisualDecision
  contentTypeDecision: CuratedCoreContentTypeDecision
  currentContentType: ContentTypeId
  proposedContentType?: ContentTypeId
  verifiedContentType?: ContentTypeId
  poReviewDisposition?: PoReviewDisposition
  round?: 'sprint-9-1-manual' | 'cover-round-2-final'
  notes: string
  reviewedAt: string
}

export function readCuratedCoreReviewDecisions(storage: Storage = localStorage): Record<string, CuratedCoreReviewDecision> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(CURATED_CORE_REVIEW_STORAGE_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => value && typeof value === 'object' && typeof (value as CuratedCoreReviewDecision).referenceId === 'string'))
  } catch {
    return {}
  }
}

export function writeCuratedCoreReviewDecisions(decisions: Record<string, CuratedCoreReviewDecision>, storage: Storage = localStorage): void {
  storage.setItem(CURATED_CORE_REVIEW_STORAGE_KEY, JSON.stringify(decisions))
}

export function createCuratedCoreReviewExport(references: Reference[], decisions: Record<string, CuratedCoreReviewDecision>, exportedAt = new Date().toISOString()) {
  return {
    schemaVersion: 2,
    exportedAt,
    productionApplied: false,
    reviews: references
      .map((reference) => {
        const local = decisions[reference.id]
        const contentTypeDecision = local?.contentTypeDecision ?? reference.contentTypePoVerificationStatus
        return {
          referenceId: reference.id,
          visualDecision: local?.visualDecision ?? (reference.poReviewDisposition === 'revise_visual' || reference.poReviewDisposition.startsWith('rejected_') ? 'reject' : 'approve'),
          contentTypeDecision,
          poReviewDisposition: local?.poReviewDisposition ?? reference.poReviewDisposition,
          currentContentType: reference.primaryContentTypeId,
          verifiedContentType: local?.verifiedContentType ?? (contentTypeDecision === 'verified' ? reference.primaryContentTypeId : undefined),
          proposedContentType: local?.proposedContentType ?? reference.proposedPrimaryContentType,
          notes: (local?.notes ?? reference.poReviewNotes ?? '').trim().slice(0, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH),
          round: local?.round ?? reference.poReviewRound,
          reviewedAt: local?.reviewedAt ?? reference.poReviewedAt ?? '',
        }
      })
      .sort((a, b) => a.referenceId.localeCompare(b.referenceId)),
  }
}
