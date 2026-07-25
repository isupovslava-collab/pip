import { describe, expect, it } from 'vitest'
import references from '../../public/data/references.json'
import { controlQueries } from '../data/controlQueries'
import { rankReferences } from '../services/rankReferences'
import type { Reference } from '../types/reference'

const library = references as Reference[]

describe('контрольные запросы библиотеки', () => {
  it('содержит по три запроса для каждого из восьми сценариев', () => {
    expect(controlQueries).toHaveLength(24)
    const counts = controlQueries.reduce<Record<string, number>>((result, query) => {
      result[query.scenarioId] = (result[query.scenarioId] ?? 0) + 1
      return result
    }, {})
    expect(Object.values(counts)).toHaveLength(8)
    expect(Object.values(counts)).toEqual(expect.arrayContaining(Array(8).fill(3)))
  })

  it.each(controlQueries)('$id возвращает детерминированный top-6 со 100% совпадением', (control) => {
    const query = {
      scenarioId: control.scenarioId, personaId: control.personaId, goalId: control.goalId,
      styleId: control.styleId, contentTypeId: control.contentTypeId,
    }
    const firstRun = rankReferences(library, query).slice(0, 6)
    const secondRun = rankReferences(library, query).slice(0, 6)
    expect(firstRun).toHaveLength(6)
    expect(firstRun[0].score).toBe(100)
    expect(firstRun.some(({ score }) => score === 100)).toBe(true)
    expect(firstRun[0].score).toBeGreaterThanOrEqual(control.minimumScore)
    expect(firstRun.map(({ id }) => id)).toEqual(secondRun.map(({ id }) => id))
  })
})
