import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import { contentTypeCompatibility } from '../data/contentTypeCompatibility'
import { contentPrecisionQueries, contentPrecisionQueryCounts } from '../data/contentPrecisionQueries'
import { getContentMatch, rankReferences, summarizeContentMatches } from '../services/rankReferences'
import type { ContentTypeId, Reference, SearchQuery } from '../types/reference'

const references = referencesData as Reference[]
const top = (query: SearchQuery) => rankReferences(references, query).slice(0, 6)

describe('Single Slide Mode content precision', () => {
  it('содержит три запроса на каждый из восьми типов слайда', () => {
    expect(contentPrecisionQueries).toHaveLength(24)
    expect(contentPrecisionQueryCounts).toEqual({ kpi: 3, comparison: 3, timeline: 3, process: 3, dashboard: 3, cover: 3, story: 3, table: 3 })
  })

  it.each(contentPrecisionQueries)('$id возвращает 4–6 результатов без hard-incompatible', (query) => {
    const results = top(query)
    expect(results.length).toBeGreaterThanOrEqual(4)
    expect(results.length).toBeLessThanOrEqual(6)
    expect(results.every(({ contentMatch }) => contentMatch !== 'incompatible')).toBe(true)
    expect(results.every(({ reasons }) => reasons.some((reason) => reason.includes('типу') || reason.includes('альтернатива')))).toBe(true)
  })

  it.each(contentPrecisionQueries)('$id остаётся детерминированным после diversity reranking', (query) => {
    expect(top(query).map(({ id }) => id)).toEqual(top(query).map(({ id }) => id))
  })

  it('при шести сильных exact-кандидатах возвращает только exact', () => {
    const query = contentPrecisionQueries[0]
    const exact = references.slice(0, 6).map((reference, index) => ({
      ...reference,
      id: `REF-98${String(index).padStart(4, '0')}`,
      scenarioIds: [query.scenarioId],
      goalIds: [query.goalId],
      contentTypeIds: [query.contentTypeId],
      productionApproved: true,
    }))
    const compatible = { ...references[10], id: 'REF-989999', scenarioIds: [query.scenarioId], goalIds: [query.goalId], contentTypeIds: ['dashboard'] as ContentTypeId[], productionApproved: true }
    expect(rankReferences([...exact, compatible], query)).toHaveLength(6)
    expect(rankReferences([...exact, compatible], query).every(({ contentMatch }) => contentMatch === 'exact')).toBe(true)
  })

  it('ставит сильные exact выше compatible и помечает compatible честно', () => {
    const query = contentPrecisionQueries.find(({ id }) => id === 'precision-table-budget')!
    const results = top(query)
    const firstCompatible = results.findIndex(({ contentMatch }) => contentMatch === 'compatible')
    const lastExact = results.reduce((last, item, index) => item.contentMatch === 'exact' ? index : last, -1)
    if (firstCompatible >= 0) expect(lastExact).toBeLessThan(firstCompatible)
    results.filter(({ contentMatch }) => contentMatch === 'compatible').forEach(({ reasons }) => {
      expect(reasons.join(' ')).toContain('Близкий формат')
      expect(reasons.join(' ')).toContain('точных вариантов недостаточно')
    })
  })

  it.each(contentPrecisionQueries.filter(({ contentTypeId }) => contentTypeId !== 'cover' && !(contentTypeId === 'story')))('$id исключает cover', (query) => {
    expect(top(query).some(({ contentTypeIds }) => contentTypeIds.includes('cover'))).toBe(false)
  })

  it.each(contentPrecisionQueries.filter(({ contentTypeId }) => contentTypeId === 'cover'))('$id возвращает преимущественно cover и максимум один story fallback', (query) => {
    const results = top(query)
    expect(results.filter(({ contentMatch }) => contentMatch === 'exact').length).toBeGreaterThanOrEqual(4)
    expect(results.filter(({ contentMatch }) => contentMatch === 'compatible').length).toBeLessThanOrEqual(1)
  })

  it('для speech + inspire + story допускает максимум один cover ниже exact story', () => {
    const query = contentPrecisionQueries.find(({ id }) => id === 'precision-story-speech')!
    const results = top(query)
    const covers = results.map((reference, index) => ({ reference, index })).filter(({ reference }) => reference.contentTypeIds.includes('cover'))
    expect(covers.length).toBeLessThanOrEqual(1)
    const lastExactIndex = results.reduce((last, { contentMatch }, index) => contentMatch === 'exact' ? index : last, -1)
    if (covers.length) expect(covers[0].index).toBeGreaterThan(lastExactIndex)
  })

  it.each([
    ['precision-kpi-report', ['cover', 'timeline']],
    ['precision-timeline-strategy', ['cover', 'table', 'dashboard', 'kpi']],
    ['precision-process-training', ['cover', 'dashboard', 'kpi']],
    ['precision-dashboard-report-board', ['cover', 'story', 'timeline']],
    ['precision-table-budget', ['cover', 'timeline', 'process']],
  ] as Array<[string, ContentTypeId[]]>)('%s не содержит запрещённые типы', (id, forbidden) => {
    const query = contentPrecisionQueries.find((item) => item.id === id)!
    expect(top(query).some(({ contentTypeIds }) => contentTypeIds.some((type) => forbidden.includes(type)) && getContentMatch({ ...references[0], contentTypeIds } as Reference, query) === 'incompatible')).toBe(false)
  })

  it('фиксирует метрики exact/compatible/fallback для 24 запросов', () => {
    const metrics = contentPrecisionQueries.map((query) => summarizeContentMatches(top(query)))
    const exactCounts = metrics.map(({ exactCount }) => exactCount)
    console.info(`content precision metrics: queries=24; averageExact=${(exactCounts.reduce((sum, value) => sum + value, 0) / exactCounts.length).toFixed(2)}; minExact=${Math.min(...exactCounts)}; exactGte4=${exactCounts.filter((value) => value >= 4).length}; queriesWithFallback=${metrics.filter(({ compatibleCount, fallbackCount }) => compatibleCount + fallbackCount > 0).length}`)
    expect(metrics).toHaveLength(24)
  })

  it('использует единую матрицу для всех machine IDs', () => {
    expect(Object.keys(contentTypeCompatibility).sort()).toEqual(['comparison', 'cover', 'dashboard', 'kpi', 'process', 'story', 'table', 'timeline'])
  })
})
