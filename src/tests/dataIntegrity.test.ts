import { describe, expect, it } from 'vitest'
import references from '../../public/data/references.json'
import { contentTypeIds, goalIds, personaIds, scenarioIds, styleIds, type Reference } from '../types/reference'

describe('целостность библиотеки', () => {
  it('содержит ровно 100 референсов с последовательными уникальными ID', () => {
    expect(references).toHaveLength(100)
    const ids = references.map(({ id }) => id)
    expect(new Set(ids).size).toBe(100)
    expect(ids).toEqual(Array.from({ length: 100 }, (_, index) => `REF-${String(index + 1).padStart(6, '0')}`))
  })

  it('содержит заполненные превью и обязательные массивы', () => {
    ;(references as Reference[]).forEach((reference) => {
      expect(reference.previewPath).toMatch(/^previews\/REF-\d{6}\.(svg|png|webp)$/)
      ;[reference.scenarioIds, reference.personaIds, reference.goalIds, reference.styleIds, reference.contentTypeIds, reference.tags, reference.useWhen, reference.avoidWhen].forEach((items) => expect(items.length).toBeGreaterThan(0))
    })
  })

  it('ограничивает профиль дизайна целыми значениями от 0 до 100', () => {
    ;(references as Reference[]).forEach(({ designDna }) => Object.values(designDna).forEach((value) => {
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(100)
    }))
  })

  it('использует только значения из словарей', () => {
    ;(references as Reference[]).forEach((reference) => {
      reference.scenarioIds.forEach((id) => expect(scenarioIds).toContain(id))
      reference.personaIds.forEach((id) => expect(personaIds).toContain(id))
      reference.goalIds.forEach((id) => expect(goalIds).toContain(id))
      reference.styleIds.forEach((id) => expect(styleIds).toContain(id))
      reference.contentTypeIds.forEach((id) => expect(contentTypeIds).toContain(id))
      expect(contentTypeIds).toContain(reference.primaryContentTypeId)
      expect(['eligible', 'review_only', 'excluded']).toContain(reference.curatedCoreStatus)
      expect(['premium', 'good', 'schematic', 'prototype', 'unknown']).toContain(reference.visualReferenceQuality)
      expect(['verified', 'reclassify', 'rejected', 'pending']).toContain(reference.contentTypePoVerificationStatus)
      expect(typeof reference.screenSuitable).toBe('boolean')
    })
  })

  it('uses an explicit, narrow PO verification migration without auto-verification', () => {
    const library = references as Reference[]
    expect(library.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'verified').map(({ id }) => id).sort()).toEqual(['REF-000013', 'REF-000016', 'REF-000025', 'REF-000028', 'REF-000034'])
    expect(library.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'reclassify').map(({ id }) => id)).toEqual(['REF-000019'])
    expect(library.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'pending')).toHaveLength(94)
    const wrongComparison = library.find(({ id }) => id === 'REF-000019')
    expect(wrongComparison).toMatchObject({ primaryContentTypeId: 'comparison', proposedPrimaryContentType: 'story', curatedCoreStatus: 'review_only' })
  })

  it('не использует устаревший сценарий idea_pitch и поддерживает продажи', () => {
    const salesReferences = (references as Reference[]).filter(({ scenarioIds: ids }) => ids.includes('sales'))
    expect(salesReferences.length).toBeGreaterThanOrEqual(20)
    ;(references as Reference[]).forEach(({ scenarioIds: ids }) => expect(ids).not.toContain('idea_pitch'))
  })
})
