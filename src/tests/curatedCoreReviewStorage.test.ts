import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { createCuratedCoreReviewExport, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH, CURATED_CORE_REVIEW_STORAGE_KEY, readCuratedCoreReviewDecisions, writeCuratedCoreReviewDecisions, type CuratedCoreReviewDecision } from '../services/curatedCoreReviewStorage'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]
const decision: CuratedCoreReviewDecision = { referenceId: 'REF-000019', visualDecision: 'approve', contentTypeDecision: 'reclassify', currentContentType: 'comparison', proposedContentType: 'story', notes: 'Strong visual, wrong type.', reviewedAt: '2026-08-15T00:00:00.000Z' }

describe('Curated Core local PO review storage', () => {
  it('preserves notes and decisions locally', () => {
    writeCuratedCoreReviewDecisions({ [decision.referenceId]: decision })
    expect(readCuratedCoreReviewDecisions()).toEqual({ [decision.referenceId]: decision })
    expect(JSON.parse(localStorage.getItem(CURATED_CORE_REVIEW_STORAGE_KEY) ?? '{}')).toHaveProperty('REF-000019')
  })

  it('exports valid, bounded, auditable JSON data', () => {
    const longDecision = { ...decision, notes: `  ${'x'.repeat(CURATED_CORE_REVIEW_NOTES_MAX_LENGTH + 20)}  ` }
    const exported = createCuratedCoreReviewExport(references, { [decision.referenceId]: longDecision, UNKNOWN: { ...decision, referenceId: 'UNKNOWN' } }, '2026-08-15T00:00:00.000Z')
    expect(exported).toMatchObject({ schemaVersion: 1, exportedAt: '2026-08-15T00:00:00.000Z' })
    expect(exported.reviews).toHaveLength(1)
    expect(exported.reviews[0]).toMatchObject({ referenceId: 'REF-000019', contentTypeDecision: 'reclassify', proposedContentType: 'story' })
    expect(exported.reviews[0].notes).toHaveLength(CURATED_CORE_REVIEW_NOTES_MAX_LENGTH)
    expect(() => JSON.parse(JSON.stringify(exported))).not.toThrow()
  })
})
