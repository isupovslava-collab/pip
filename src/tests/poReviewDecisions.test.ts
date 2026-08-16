import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import poRound from '../data/curatedCore/po-review-round-1.json'
import { isCuratedCoreEligible } from '../services/selectCuratedCore'
import type { ContentTypeId, Reference } from '../types/reference'

const references = referencesJson as Reference[]
const approvedByType: Record<ContentTypeId, string[]> = {
  kpi: ['REF-000014', 'REF-000025', 'REF-000036'],
  comparison: ['REF-000013', 'REF-000033'],
  timeline: ['REF-000021', 'REF-000029'],
  process: ['REF-000020', 'REF-000022', 'REF-000028'],
  dashboard: ['REF-000023', 'REF-000026'],
  cover: [],
  story: ['REF-000015', 'REF-000018'],
  table: ['REF-000024', 'REF-000027', 'REF-000034'],
}

describe('Product Owner Round 1 decisions', () => {
  it('maps every one of the 100 legacy references exactly once', () => {
    const mapped = [...poRound.decisions.map(({ referenceId }) => referenceId), ...poRound.rejectedSchematicReferenceIds]
    expect(mapped).toHaveLength(100)
    expect(new Set(mapped).size).toBe(100)
    expect(new Set(mapped)).toEqual(new Set(references.map(({ id }) => id)))
  })

  it.each(Object.entries(approvedByType) as Array<[ContentTypeId, string[]]>)('applies the exact approved whitelist for %s', (type, expected) => {
    const actual = references.filter(({ poReviewDisposition, primaryContentTypeId }) => poReviewDisposition === 'approved' && primaryContentTypeId === type).map(({ id }) => id).sort()
    expect(actual).toEqual([...expected].sort())
  })

  it('keeps all non-approved dispositions outside production', () => {
    const eligible = references.filter(isCuratedCoreEligible)
    expect(eligible).toHaveLength(17)
    expect(eligible.every(({ poReviewDisposition, contentTypePoVerificationStatus, visualReferenceQuality }) => poReviewDisposition === 'approved' && contentTypePoVerificationStatus === 'verified' && visualReferenceQuality === 'premium')).toBe(true)
    expect(references.filter(({ poReviewDisposition }) => poReviewDisposition !== 'approved').some(isCuratedCoreEligible)).toBe(false)
  })

  it('preserves the explicit reclassification, revise, quality rejection and pending queues', () => {
    expect(references.filter(({ poReviewDisposition }) => poReviewDisposition === 'reclassify').map(({ id }) => id)).toEqual(['REF-000016', 'REF-000019', 'REF-000030', 'REF-000032'])
    expect(references.find(({ id }) => id === 'REF-000016')).toMatchObject({ primaryContentTypeId: 'story', proposedPrimaryContentType: 'cover', curatedCoreStatus: 'review_only' })
    expect(references.find(({ id }) => id === 'REF-000019')).toMatchObject({ primaryContentTypeId: 'comparison', proposedPrimaryContentType: 'story', curatedCoreStatus: 'review_only' })
    expect(references.find(({ id }) => id === 'REF-000030')).toMatchObject({ primaryContentTypeId: 'story', proposedPrimaryContentType: 'process', curatedCoreStatus: 'review_only' })
    expect(references.find(({ id }) => id === 'REF-000032')).toMatchObject({ primaryContentTypeId: 'timeline', curatedCoreStatus: 'review_only' })
    expect(references.find(({ id }) => id === 'REF-000032')).not.toHaveProperty('proposedPrimaryContentType')
    expect(references.find(({ id }) => id === 'REF-000017')).toMatchObject({ poReviewDisposition: 'revise_visual', primaryContentTypeId: 'cover', visualReferenceQuality: 'good', curatedCoreStatus: 'review_only' })
    expect(references.find(({ id }) => id === 'REF-000031')).toMatchObject({ poReviewDisposition: 'rejected_quality', primaryContentTypeId: 'timeline', visualReferenceQuality: 'good', curatedCoreStatus: 'excluded' })
    expect(references.find(({ id }) => id === 'REF-000035')).toMatchObject({ poReviewDisposition: 'pending', curatedCoreStatus: 'review_only' })
  })
})
