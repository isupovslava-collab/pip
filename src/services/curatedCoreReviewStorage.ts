import type { ContentTypeId, Reference } from '../types/reference'

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
  const referenceIds = new Set(references.map(({ id }) => id))
  return {
    schemaVersion: 1,
    exportedAt,
    reviews: Object.values(decisions)
      .filter(({ referenceId }) => referenceIds.has(referenceId))
      .map((decision) => ({ ...decision, notes: decision.notes.trim().slice(0, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH) }))
      .sort((a, b) => a.referenceId.localeCompare(b.referenceId)),
  }
}
