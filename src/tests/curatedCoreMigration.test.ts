import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import coverFinalRound from '../data/curatedCore/cover-round-2-final.json'
import poRound from '../data/curatedCore/po-review-round-1.json'
import { normalizeReferences, type StoredReference } from '../services/loadReferences'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]

describe('Content Type PO verification migration', () => {
  it('defaults a missing field to pending without changing reference data', () => {
    const source = references[49]
    const legacy = { ...source } as Partial<Reference>
    delete legacy.contentTypePoVerificationStatus
    delete legacy.poReviewDisposition
    const [normalized] = normalizeReferences([legacy as StoredReference])
    expect(normalized.contentTypePoVerificationStatus).toBe('pending')
    expect(normalized.poReviewDisposition).toBe('pending')
    expect(normalized.id).toBe(source.id)
    expect(normalized.title).toBe(source.title)
    expect(normalized.scenarioIds).toEqual(source.scenarioIds)
  })

  it('preserves the explicit Product Owner Round 1 map', () => {
    expect(poRound.decisions).toHaveLength(24)
    expect(poRound.rejectedSchematicReferenceIds).toHaveLength(76)
    expect(new Set([...poRound.decisions.map(({ referenceId }) => referenceId), ...poRound.rejectedSchematicReferenceIds]).size).toBe(100)
    expect(references.filter(({ poReviewDisposition }) => poReviewDisposition === 'approved')).toHaveLength(20)
    expect(coverFinalRound.decisions.filter(({ decision }) => decision === 'approved')).toHaveLength(3)
    expect(coverFinalRound.decisions.filter(({ decision }) => decision === 'revise_visual')).toHaveLength(1)
  })
})
