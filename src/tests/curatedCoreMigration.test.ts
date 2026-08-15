import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import verificationMap from '../data/curated-core-po-verification-map.json'
import { normalizeReferences, type StoredReference } from '../services/loadReferences'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]

describe('Content Type PO verification migration', () => {
  it('defaults a missing field to pending without changing reference data', () => {
    const source = references[49]
    const legacy = { ...source } as Partial<Reference>
    delete legacy.contentTypePoVerificationStatus
    const [normalized] = normalizeReferences([legacy as StoredReference])
    expect(normalized.contentTypePoVerificationStatus).toBe('pending')
    expect(normalized.id).toBe(source.id)
    expect(normalized.title).toBe(source.title)
    expect(normalized.scenarioIds).toEqual(source.scenarioIds)
  })

  it('preserves only explicit historical Product Owner decisions', () => {
    expect(Object.keys(verificationMap).sort()).toEqual(['REF-000013', 'REF-000016', 'REF-000019', 'REF-000025', 'REF-000028', 'REF-000034'])
    expect(Object.values(verificationMap).filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'verified')).toHaveLength(5)
    expect(references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'verified')).toHaveLength(5)
  })
})
