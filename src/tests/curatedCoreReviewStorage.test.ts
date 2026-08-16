import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { createCuratedCoreReviewExport, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH, CURATED_CORE_REVIEW_STORAGE_KEY, readCuratedCoreReviewDecisions, writeCuratedCoreReviewDecisions, type CuratedCoreReviewDecision } from '../services/curatedCoreReviewStorage'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]
const decision: CuratedCoreReviewDecision = { referenceId: 'REF-000019', visualDecision: 'approve', contentTypeDecision: 'reclassify', poReviewDisposition: 'reclassify', currentContentType: 'comparison', proposedContentType: 'story', notes: 'Strong visual, wrong type.', round: 'sprint-9-1-manual', reviewedAt: '2026-08-15T00:00:00.000Z' }

describe('Curated Core local PO review storage', () => {
  it('preserves notes and decisions locally', () => {
    writeCuratedCoreReviewDecisions({ [decision.referenceId]: decision })
    expect(readCuratedCoreReviewDecisions()).toEqual({ [decision.referenceId]: decision })
    expect(JSON.parse(localStorage.getItem(CURATED_CORE_REVIEW_STORAGE_KEY) ?? '{}')).toHaveProperty('REF-000019')
  })

  it('exports valid, bounded, auditable JSON data', () => {
    const longDecision = { ...decision, notes: `  ${'x'.repeat(CURATED_CORE_REVIEW_NOTES_MAX_LENGTH + 20)}  ` }
    const exported = createCuratedCoreReviewExport(references, { [decision.referenceId]: longDecision, UNKNOWN: { ...decision, referenceId: 'UNKNOWN' } }, '2026-08-15T00:00:00.000Z')
    expect(exported).toMatchObject({ schemaVersion: 2, exportedAt: '2026-08-15T00:00:00.000Z', productionApplied: false })
    expect(exported.reviews).toHaveLength(100)
    const reviewed = exported.reviews.find(({ referenceId }) => referenceId === 'REF-000019')
    expect(reviewed).toMatchObject({ referenceId: 'REF-000019', contentTypeDecision: 'reclassify', poReviewDisposition: 'reclassify', proposedContentType: 'story', round: 'sprint-9-1-manual' })
    expect(reviewed?.notes).toHaveLength(CURATED_CORE_REVIEW_NOTES_MAX_LENGTH)
    expect(() => JSON.parse(JSON.stringify(exported))).not.toThrow()
  })
})
