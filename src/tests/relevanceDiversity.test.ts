import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import manifest from '../../tools/hero-references/manifest.json'
import { relevanceQueries, relevanceQueryPairs } from '../data/relevanceQueries'
import { isHardContentMismatch, rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'

const references = referencesData as Reference[]
const byId = new Map(relevanceQueries.map((query) => [query.id, query]))
const top6 = (query: SearchQuery) => rankReferences(references, query).slice(0, 6)

function overlap(left: string[], right: string[]) {
  const intersection = left.filter((id) => right.includes(id)).length
  return { count: intersection, jaccard: intersection / new Set([...left, ...right]).size }
}

describe('Ranking v2 relevance and diversity', () => {
  it('сохраняет 100 records и интегрирует ровно 6 approved Hero', () => {
    expect(references).toHaveLength(100)
    expect(references.filter(({ qualityTier, productionApproved }) => qualityTier === 'hero' && productionApproved)).toHaveLength(6)
    expect(manifest.filter(({ productionApproved }) => !productionApproved).map(({ scenario }) => scenario).sort()).toEqual(['meeting', 'strategy'])
  })

  it.each([
    ['r-sales-comparison', 'sales'], ['r-speech-story', 'speech'], ['r-project-comparison', 'project'],
    ['r-report-kpi', 'report'], ['r-training-process', 'training'], ['r-budget-table', 'budget_defense'],
  ])('%s поднимает релевантный approved Hero в Top 3', (queryId, scenario) => {
    const result = top6(byId.get(queryId)!)
    expect(result.slice(0, 3).some(({ qualityTier, heroScenarioId }) => qualityTier === 'hero' && heroScenarioId === scenario)).toBe(true)
  })

  it.each(['r-sales-comparison', 'r-project-timeline', 'r-meeting-process', 'r-report-kpi', 'r-training-process', 'r-strategy-timeline', 'r-budget-table'])('%s исключает cover при достаточном релевантном пуле', (queryId) => {
    const query = byId.get(queryId)!
    expect(top6(query).some((reference) => reference.contentTypeIds.includes('cover') && isHardContentMismatch(reference, query))).toBe(false)
  })

  it('не применяет красоту как замену hard-incompatible типу', () => {
    const query = byId.get('r-project-timeline')!
    const hero = references.find(({ heroScenarioId }) => heroScenarioId === 'project')!
    const exact = references.find(({ scenarioIds, contentTypeIds, qualityTier }) => scenarioIds.includes('project') && contentTypeIds.includes('timeline') && qualityTier !== 'hero')!
    expect(isHardContentMismatch(hero, query)).toBe(false)
    const mismatchedHero = { ...hero, id: 'REF-990001', contentTypeIds: ['cover'] as Reference['contentTypeIds'] }
    expect(rankReferences([mismatchedHero, exact], query)[0].id).toBe(exact.id)
  })

  it('использует прозрачный fallback, если совместимых кандидатов меньше шести', () => {
    const query = byId.get('r-project-timeline')!
    const exact = references.filter((reference) => reference.contentTypeIds.includes('timeline')).slice(0, 3)
    const covers = references.filter((reference) => reference.contentTypeIds.includes('cover')).slice(0, 3)
    const result = rankReferences([...exact, ...covers], query).slice(0, 6)
    expect(result).toHaveLength(6)
    expect(result.some(({ contentMatch }) => contentMatch === 'hard-fallback')).toBe(true)
    expect(result.find(({ contentMatch }) => contentMatch === 'hard-fallback')?.reasons.join(' ')).toContain('резервный fallback')
  })

  it.each(relevanceQueries)('$id возвращает deterministic Top 6 с 3+ families и без тройных visual duplicates', (query) => {
    const first = top6(query)
    const second = top6(query)
    expect(first.map(({ id }) => id)).toEqual(second.map(({ id }) => id))
    expect(new Set(first.map(({ compositionFamily }) => compositionFamily)).size).toBeGreaterThanOrEqual(3)
    const familyCounts = Object.values(first.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.compositionFamily]: (acc[item.compositionFamily] ?? 0) + 1 }), {}))
    const directionCounts = Object.values(first.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.visualDirection]: (acc[item.visualDirection] ?? 0) + 1 }), {}))
    expect(Math.max(...familyCounts)).toBeLessThanOrEqual(2)
    expect(Math.max(...directionCounts)).toBeLessThanOrEqual(2)
    expect(first.every(({ reasons }) => reasons.length >= 3 && reasons.length <= 5)).toBe(true)
  })

  it('держит overlap существенно разных запросов не выше 2 из 6', () => {
    const metrics = relevanceQueryPairs.map(([leftId, rightId]) => {
      const left = top6(byId.get(leftId)!).map(({ id }) => id)
      const right = top6(byId.get(rightId)!).map(({ id }) => id)
      const value = overlap(left, right)
      expect(left.slice(0, 3)).not.toEqual(right.slice(0, 3))
      expect(value.count, `${leftId} vs ${rightId}`).toBeLessThanOrEqual(2)
      return value
    })
    const average = metrics.reduce((sum, item) => sum + item.count, 0) / metrics.length
    const maximum = Math.max(...metrics.map(({ count }) => count))
    const jaccard = metrics.reduce((sum, item) => sum + item.jaccard, 0) / metrics.length
    console.info(`diversity metrics: pairs=${metrics.length}; averageOverlap=${average.toFixed(2)}; maxOverlap=${maximum}; averageJaccard=${jaccard.toFixed(3)}`)
  })
})
