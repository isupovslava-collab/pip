import type { ContentTypeId } from '../types/reference'
import type { ReferenceIntelligenceV1 } from '../types/presentationIntelligence'

export const PRESENTATION_INTELLIGENCE_REVIEW_STORAGE_KEY = 'pipPresentationIntelligenceReviewV1'
export const INTELLIGENCE_REVIEW_NOTES_MAX_LENGTH = 4000

export type IntelligenceReviewStatus = '' | 'approve' | 'revise' | 'reject'
export interface IntelligenceReviewRecord { referenceId: string; intelligenceStatus: IntelligenceReviewStatus; poNotes: string; timestamp: string }

export function readPresentationIntelligenceReviews(storage: Storage = localStorage): Record<string, IntelligenceReviewRecord> {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(PRESENTATION_INTELLIGENCE_REVIEW_STORAGE_KEY) ?? '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid Intelligence review data.')
    return parsed as Record<string, IntelligenceReviewRecord>
  } catch {
    storage.removeItem(PRESENTATION_INTELLIGENCE_REVIEW_STORAGE_KEY)
    return {}
  }
}

export function writePresentationIntelligenceReviews(reviews: Record<string, IntelligenceReviewRecord>, storage: Storage = localStorage): void {
  storage.setItem(PRESENTATION_INTELLIGENCE_REVIEW_STORAGE_KEY, JSON.stringify(reviews))
}

export function createPresentationIntelligenceReviewExport(intelligence: ReferenceIntelligenceV1[], reviews: Record<string, IntelligenceReviewRecord>, exportedAt = new Date().toISOString()) {
  return {
    schemaVersion: 1,
    exportedAt,
    productionApprovalAffected: false,
    reviews: intelligence.map((item) => ({
      referenceId: item.referenceId,
      contentType: item.contentTypeId as ContentTypeId,
      intelligenceStatus: reviews[item.referenceId]?.intelligenceStatus ?? '',
      poNotes: reviews[item.referenceId]?.poNotes ?? '',
      timestamp: reviews[item.referenceId]?.timestamp ?? '',
    })),
  }
}
