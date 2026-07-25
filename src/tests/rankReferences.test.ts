import { describe, expect, it } from 'vitest'
import references from '../../public/data/references.json'
import { rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'

const controlQuery: SearchQuery = {
  scenarioId: 'budget_defense', personaId: 'ceo', goalId: 'approve', styleId: 'executive', contentTypeId: 'kpi',
}

describe('rankReferences', () => {
  it('ставит REF-000001 на первое место со 100 баллами', () => {
    const result = rankReferences(references as Reference[], controlQuery)
    expect(result[0]).toMatchObject({ id: 'REF-000001', score: 100 })
    expect(result[0].reasons).toHaveLength(5)
  })

  it('выдает логичный полный результат для сценария продаж', () => {
    const salesQuery: SearchQuery = {
      scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison',
    }
    const result = rankReferences(references as Reference[], salesQuery)

    expect(result[0]).toMatchObject({ id: 'REF-000004', score: 100 })
    expect(result[0].reasons).toHaveLength(5)
  })

  it('сортирует результаты по убыванию баллов', () => {
    const scores = rankReferences(references as Reference[], controlQuery).map(({ score }) => score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('при равных баллах сортирует по названию', () => {
    const source = references.slice(8, 10) as Reference[]
    const neutralQuery: SearchQuery = { scenarioId: 'budget_defense', personaId: 'cfo', goalId: 'teach', styleId: 'industrial', contentTypeId: 'dashboard' }
    const result = rankReferences(source, neutralQuery)
    expect(result.map(({ title }) => title)).toEqual([...result.map(({ title }) => title)].sort((a, b) => a.localeCompare(b, 'ru')))
  })

  it('создает объяснения только для совпавших параметров', () => {
    const result = rankReferences([references[1] as Reference], controlQuery)[0]
    expect(result.score).toBe(45)
    expect(result.reasons).toHaveLength(2)
    expect(result.reasons.join(' ')).toContain('Защита бюджета')
    expect(result.reasons.join(' ')).toContain('Строгий управленческий')
  })

  it('не изменяет исходный массив', () => {
    const source = structuredClone(references) as Reference[]
    const snapshot = structuredClone(source)
    rankReferences(source, controlQuery)
    expect(source).toEqual(snapshot)
  })
})
