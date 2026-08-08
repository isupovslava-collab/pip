import { describe, expect, it } from 'vitest'
import { sourceReferences, sourceVerificationReviews } from '../data/sourceReferences/source-references'
import { sourceReferenceCoverage, sourceReferenceSummary } from '../lib/referenceVerification/sourceReferenceCoverage'
import { validateSourceReferences } from '../lib/referenceVerification/validateSourceReferences'
import { contentTypeIds } from '../types/reference'

describe('Verified Reference Core', () => {
  it('проходит семь gate-проверок и автоматическую проверку целостности', () => {
    expect(validateSourceReferences(sourceReferences, sourceVerificationReviews)).toEqual([])
    const verified = sourceReferences.filter(({ verificationStatus }) => verificationStatus === 'verified')
    expect(verified).toHaveLength(8)
    verified.forEach((source) => {
      const review = sourceVerificationReviews.find(({ sourceReferenceId }) => sourceReferenceId === source.id)
      expect(source.urlStatus).toBe('working')
      expect(source.pageNumber ?? source.slideNumber).not.toBeNull()
      expect(source.organization).not.toBe('')
      expect(source.compositionPrinciple.length).toBeGreaterThan(40)
      expect(review).toMatchObject({
        sourceGate: 'pass', documentGate: 'pass', pageGate: 'pass', visualGate: 'pass',
        contentTypeGate: 'pass', scenarioGate: 'pass', rightsGate: 'pass',
        visualReview: 'awaiting_po_review',
      })
    })
  })

  it('держит честное покрытие 1/3 по каждому из восьми типов', () => {
    const coverage = sourceReferenceCoverage(sourceReferences)
    expect(coverage.map(({ contentTypeId }) => contentTypeId)).toEqual(contentTypeIds)
    coverage.forEach((row) => expect(row).toMatchObject({ verifiedCount: 1, gapToTarget3: 2 }))
  })

  it('соблюдает лимиты разнообразия и консервативные права', () => {
    const summary = sourceReferenceSummary(sourceReferences)
    expect(summary).toMatchObject({ total: 16, sourceFound: 4, verified: 8, rejected: 4, uniqueOrganizations: 5, uniquePresentations: 6 })
    const verified = sourceReferences.filter(({ verificationStatus }) => verificationStatus === 'verified')
    expect(new Set(verified.map(({ visualDirection }) => visualDirection)).size).toBeGreaterThanOrEqual(6)
    expect(verified.every(({ rightsStatus }) => ['explicit-permission', 'link-only-no-local-copy'].includes(rightsStatus))).toBe(true)
    verified.filter(({ rightsStatus }) => rightsStatus === 'explicit-permission').forEach(({ rightsEvidenceUrl }) => expect(rightsEvidenceUrl).toMatch(/^https:\/\//))
  })
})
