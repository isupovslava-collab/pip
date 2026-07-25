import { describe, expect, it } from 'vitest'
import references from '../../public/data/references.json'
import { contentTypeIds, goalIds, personaIds, scenarioIds, styleIds, type Reference } from '../types/reference'

describe('целостность библиотеки', () => {
  it('содержит ровно 12 референсов с уникальными корректными ID', () => {
    expect(references).toHaveLength(12)
    const ids = references.map(({ id }) => id)
    expect(new Set(ids).size).toBe(12)
    ids.forEach((id) => expect(id).toMatch(/^REF-\d{6}$/))
  })

  it('содержит заполненные превью и обязательные массивы', () => {
    ;(references as Reference[]).forEach((reference) => {
      expect(reference.previewPath).toMatch(/^previews\/REF-\d{6}\.svg$/)
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
    })
  })
})
