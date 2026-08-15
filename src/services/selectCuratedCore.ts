import { RANKING_WEIGHTS } from './rankReferences'
import type { MatchKey, RankedReference, Reference, SearchQuery } from '../types/reference'
import { labels } from '../data/dictionaries'

export const MAX_CURATED_CORE_RESULTS = 3

export function isCuratedCoreEligible(reference: Reference): boolean {
  return reference.curatedCoreStatus === 'eligible'
    && reference.visualReferenceQuality === 'premium'
    && reference.contentTypePoVerificationStatus === 'verified'
    && reference.screenSuitable
    && reference.productionApproved
    && (reference.previewMode === 'original_pip_interpretation'
      ? reference.qualityTier === 'hero'
      : reference.sourceBacked)
}

function matches(reference: Reference, query: SearchQuery, key: MatchKey) {
  if (key === 'contentTypeId') return reference.primaryContentTypeId === query.contentTypeId
  const referenceKey = `${key.slice(0, -2)}Ids` as 'scenarioIds' | 'personaIds' | 'goalIds' | 'styleIds'
  return reference[referenceKey].includes(query[key] as never)
}

function score(reference: Reference, query: SearchQuery) {
  return (Object.keys(RANKING_WEIGHTS) as MatchKey[]).reduce((total, key) => total + (matches(reference, query, key) ? RANKING_WEIGHTS[key] : 0), 0)
}

function ranked(reference: Reference, query: SearchQuery): RankedReference {
  const reasons = [
    `Точно соответствует типу слайда «${labels.contentType[query.contentTypeId]}».`,
    reference.scenarioIds.includes(query.scenarioId)
      ? `Композиция подготовлена для выбранного сценария и помогает быстро увидеть главный вывод.`
      : `Премиальная композиция даёт ясный визуальный ориентир для выбранной задачи.`,
  ]
  return { ...reference, score: score(reference, query), contentMatch: 'exact', reasons }
}

export function selectCuratedCore(references: Reference[], query: SearchQuery): RankedReference[] {
  const pool = references
    .filter((reference) => isCuratedCoreEligible(reference) && reference.primaryContentTypeId === query.contentTypeId)
    .map((reference) => ranked(reference, query))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ru') || a.id.localeCompare(b.id))

  const selected: RankedReference[] = []
  const usedFamilies = new Set<string>()
  for (const reference of pool) {
    if (usedFamilies.has(reference.compositionFamily)) continue
    selected.push(reference)
    usedFamilies.add(reference.compositionFamily)
    if (selected.length === MAX_CURATED_CORE_RESULTS) return selected
  }
  for (const reference of pool) {
    if (selected.some(({ id }) => id === reference.id)) continue
    selected.push(reference)
    if (selected.length === MAX_CURATED_CORE_RESULTS) break
  }
  return selected
}
