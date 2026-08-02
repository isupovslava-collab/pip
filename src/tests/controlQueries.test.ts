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

  it.each(controlQueries)('$id возвращает детерминированный релевантный top-6', (control) => {
    const query = {
      scenarioId: control.scenarioId, personaId: control.personaId, goalId: control.goalId,
      styleId: control.styleId, contentTypeId: control.contentTypeId,
    }
    const firstRun = rankReferences(library, query).slice(0, 6)
    const secondRun = rankReferences(library, query).slice(0, 6)
    expect(firstRun).toHaveLength(6)
    expect(firstRun[0].score).toBeGreaterThanOrEqual(70)
    expect(firstRun.every(({ contentMatch }) => contentMatch !== 'incompatible')).toBe(true)
    expect(firstRun.filter(({ contentMatch }) => contentMatch === 'exact').length).toBeGreaterThanOrEqual(2)
    expect(firstRun.map(({ id }) => id)).toEqual(secondRun.map(({ id }) => id))
  })
})
