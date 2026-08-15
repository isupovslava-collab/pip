import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { MAX_CURATED_CORE_RESULTS, isCuratedCoreEligible, selectCuratedCore } from '../services/selectCuratedCore'
import { contentTypeIds, type ContentTypeId, type Reference, type SearchQuery } from '../types/reference'

const references = referencesJson as Reference[]
const query: SearchQuery = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }
const make = (id: string, type: ContentTypeId, family: string): Reference => ({ ...references[0], id, title: id, primaryContentTypeId: type, contentTypeIds: [type], compositionFamily: family, curatedCoreStatus: 'eligible', visualReferenceQuality: 'premium', contentTypePoVerificationStatus: 'verified', contentTypePoVerifiedAt: '2026-08-15', contentTypePoVerifiedBy: 'product_owner', screenSuitable: true, productionApproved: true, previewMode: 'original_pip_interpretation', qualityTier: 'hero' })

describe('Premium Curated Core selection', () => {
  it('uses the explicit premium product gate', () => {
    expect(references.filter(isCuratedCoreEligible).map(({ id }) => id).sort()).toEqual(['REF-000013', 'REF-000016', 'REF-000025', 'REF-000028', 'REF-000034'])
  })

  it.each([0, 1, 2, 3, 4])('returns a deterministic maximum of three results from a pool of %i', (count) => {
    const pool = Array.from({ length: count }, (_, index) => make(`TEST-${index}`, 'comparison', `family-${index}`))
    const first = selectCuratedCore(pool, query)
    const second = selectCuratedCore([...pool].reverse(), query)
    expect(first).toHaveLength(Math.min(count, MAX_CURATED_CORE_RESULTS))
    expect(second.map(({ id }) => id)).toEqual(first.map(({ id }) => id))
  })

  it.each(contentTypeIds)('never exposes a wrong primary type for %s', (contentTypeId) => {
    const mixed = contentTypeIds.map((type, index) => make(`TYPE-${index}`, type, `family-${index}`))
    const result = selectCuratedCore(mixed, { ...query, contentTypeId })
    expect(result.every(({ primaryContentTypeId, visualReferenceQuality, curatedCoreStatus }) => primaryContentTypeId === contentTypeId && visualReferenceQuality === 'premium' && curatedCoreStatus === 'eligible')).toBe(true)
  })

  it('prefers distinct composition families', () => {
    const pool = [make('A', 'comparison', 'same'), make('B', 'comparison', 'same'), make('C', 'comparison', 'different'), make('D', 'comparison', 'third')]
    expect(new Set(selectCuratedCore(pool, query).map(({ compositionFamily }) => compositionFamily)).size).toBe(3)
  })

  it.each(['pending', 'reclassify', 'rejected'] as const)('never exposes a %s reference', (contentTypePoVerificationStatus) => {
    const reference = { ...make('BLOCKED', 'comparison', 'blocked'), contentTypePoVerificationStatus }
    expect(selectCuratedCore([reference], query)).toEqual([])
  })

  it('exposes a PO-verified exact Premium reference', () => {
    expect(selectCuratedCore([make('VERIFIED', 'comparison', 'verified')], query).map(({ id }) => id)).toEqual(['VERIFIED'])
  })

  it('requires both Premium visual quality and PO type verification', () => {
    const noTypeApproval = { ...make('NO-TYPE', 'comparison', 'a'), contentTypePoVerificationStatus: 'pending' as const }
    const noPremium = { ...make('NO-PREMIUM', 'comparison', 'b'), visualReferenceQuality: 'good' as const }
    expect(selectCuratedCore([noTypeApproval, noPremium], query)).toEqual([])
  })

  it('does not use proposedPrimaryContentType before explicit verification', () => {
    const proposed = { ...make('PROPOSED', 'story', 'proposal'), contentTypePoVerificationStatus: 'reclassify' as const, proposedPrimaryContentType: 'comparison' as const }
    expect(selectCuratedCore([proposed], query)).toEqual([])
  })
})
