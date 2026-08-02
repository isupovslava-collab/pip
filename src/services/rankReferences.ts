import { contentTypeCompatibility, isSpeechStoryCoverException } from '../data/contentTypeCompatibility'
import { labels } from '../data/dictionaries'
import type { MatchKey, RankedReference, Reference, SearchQuery } from '../types/reference'

export const RANKING_WEIGHTS: Record<MatchKey, number> = {
  scenarioId: 30,
  personaId: 20,
  goalId: 20,
  styleId: 15,
  contentTypeId: 15,
}

export const HERO_TIE_BREAKER_BONUS = 3
export const HERO_MIN_BASE_SCORE = 60
const STRONG_EXACT_MIN_SCORE = 35
const RESULT_LIMIT = 6
const MIN_RESULTS = 4

function isMatch(reference: Reference, query: SearchQuery, key: MatchKey): boolean {
  switch (key) {
    case 'scenarioId': return reference.scenarioIds.includes(query.scenarioId)
    case 'personaId': return reference.personaIds.includes(query.personaId)
    case 'goalId': return reference.goalIds.includes(query.goalId)
    case 'styleId': return reference.styleIds.includes(query.styleId)
    case 'contentTypeId': return reference.contentTypeIds.includes(query.contentTypeId)
  }
}

export function getContentMatch(reference: Reference, query: SearchQuery): RankedReference['contentMatch'] {
  const specialCover = isSpeechStoryCoverException(query)
  if (reference.contentTypeIds.includes('cover') && query.contentTypeId !== 'cover' && !specialCover) return 'incompatible'
  if (reference.contentTypeIds.includes('cover') && specialCover) return 'compatible'
  if (reference.contentTypeIds.includes(query.contentTypeId)) return 'exact'

  const rule = contentTypeCompatibility[query.contentTypeId]
  const compatible = reference.contentTypeIds.some((type) => rule.compatible.includes(type))
  if (compatible) return 'compatible'
  if (reference.contentTypeIds.some((type) => rule.hardIncompatible.includes(type))) return 'incompatible'
  return 'fallback'
}

export function isHardContentMismatch(reference: Reference, query: SearchQuery): boolean {
  return getContentMatch(reference, query) === 'incompatible'
}

function semanticPhrase(reference: Reference): string {
  const specificTag = reference.tags.find((tag) => tag.length > 22) ?? reference.category.toLocaleLowerCase('ru')
  return specificTag.replace(/[.]+$/, '')
}

function buildReasons(reference: Reference, query: SearchQuery, matchedKeys: MatchKey[], contentMatch: RankedReference['contentMatch'], heroEligible: boolean): string[] {
  const reasons: string[] = []
  if (contentMatch === 'exact') reasons.push(`Соответствует выбранному типу «${labels.contentType[query.contentTypeId]}».`)
  if (contentMatch === 'compatible') {
    reasons.push(`Близкий формат к выбранному типу «${labels.contentType[query.contentTypeId]}»: ${labels.contentType[reference.contentTypeIds[0]]}.`)
    reasons.push('Добавлен как альтернатива, потому что точных вариантов недостаточно.')
  }
  if (contentMatch === 'fallback') reasons.push('Дополнительная альтернатива: точных и совместимых вариантов недостаточно.')
  if (contentMatch === 'incompatible') reasons.push('Резервная альтернатива: показана только потому, что подходящих форматов меньше четырёх.')
  if (heroEligible) reasons.push('Высокая визуальная проработка: одобренный production Hero Reference.')
  if (matchedKeys.includes('scenarioId')) reasons.push(`Подходит для сценария «${labels.scenario[query.scenarioId]}» и раскрывает ${semanticPhrase(reference)}.`)
  if (matchedKeys.includes('goalId')) reasons.push(`Помогает ${labels.goal[query.goalId].toLocaleLowerCase('ru')} через ясный вывод и следующий шаг.`)
  if (matchedKeys.includes('personaId')) reasons.push(`Плотность и аргументация подходят аудитории «${labels.persona[query.personaId]}».`)
  if (matchedKeys.includes('styleId')) reasons.push(`Визуальная подача соответствует направлению «${labels.style[query.styleId]}».`)
  if (reasons.length < 3) reasons.push(`Композиция «${reference.compositionFamily}» поддерживает ясную иерархию сообщения.`)
  if (reasons.length < 3) reasons.push(`Визуальное направление «${reference.visualDirection}» соответствует содержанию слайда.`)
  return reasons.slice(0, 5)
}

interface Candidate {
  reference: Reference
  baseScore: number
  rankScore: number
  matchedKeys: MatchKey[]
  contentMatch: RankedReference['contentMatch']
  sourceFamily: string
  heroEligible: boolean
  strongExact: boolean
}

function candidateFor(reference: Reference, query: SearchQuery): Candidate {
  const matchedKeys = (Object.keys(RANKING_WEIGHTS) as MatchKey[]).filter((key) => isMatch(reference, query, key))
  const baseScore = matchedKeys.reduce((score, key) => score + RANKING_WEIGHTS[key], 0)
  const contentMatch = getContentMatch(reference, query)
  const heroEligible = reference.qualityTier === 'hero'
    && reference.productionApproved
    && reference.heroScenarioId === query.scenarioId
    && (contentMatch === 'exact' || contentMatch === 'compatible')
    && baseScore >= HERO_MIN_BASE_SCORE
  const strongExact = contentMatch === 'exact'
    && baseScore >= STRONG_EXACT_MIN_SCORE
    && (matchedKeys.includes('scenarioId') || matchedKeys.includes('goalId'))
  return {
    reference,
    baseScore,
    rankScore: baseScore + (heroEligible ? HERO_TIE_BREAKER_BONUS : 0),
    matchedKeys,
    contentMatch,
    sourceFamily: reference.sourceOrganization ?? reference.sourceType,
    heroEligible,
    strongExact,
  }
}

function similarityPenalty(candidate: Candidate, selected: Candidate[]): number {
  const familyCount = selected.filter(({ reference }) => reference.compositionFamily === candidate.reference.compositionFamily).length
  const directionCount = selected.filter(({ reference }) => reference.visualDirection === candidate.reference.visualDirection).length
  const sourceCount = selected.filter(({ sourceFamily }) => sourceFamily === candidate.sourceFamily).length
  const selectedTags = new Set(selected.flatMap(({ reference }) => reference.tags))
  const sharedTags = candidate.reference.tags.filter((tag) => selectedTags.has(tag)).length
  return (familyCount >= 2 ? 18 : familyCount * 4)
    + (directionCount >= 2 ? 12 : directionCount * 3)
    + (sourceCount >= 2 ? 4 : sourceCount)
    + Math.min(sharedTags, 2)
}

function deterministicCompare(a: Candidate, b: Candidate): number {
  return b.rankScore - a.rankScore
    || a.reference.title.localeCompare(b.reference.title, 'ru')
    || a.reference.id.localeCompare(b.reference.id)
}

function takeDiverse(candidates: Candidate[], count: number, selected: Candidate[]): Candidate[] {
  const remaining = [...candidates]
  const picked: Candidate[] = []
  while (picked.length < count && remaining.length) {
    const context = [...selected, ...picked]
    remaining.sort((a, b) => {
      const adjustedA = a.rankScore - similarityPenalty(a, context)
      const adjustedB = b.rankScore - similarityPenalty(b, context)
      return adjustedB - adjustedA || deterministicCompare(a, b)
    })
    picked.push(remaining.shift()!)
  }
  return picked
}

function appendFrom(selected: Candidate[], pool: Candidate[], limit = RESULT_LIMIT) {
  selected.push(...takeDiverse(pool.filter((candidate) => !selected.includes(candidate)), Math.max(0, limit - selected.length), selected))
}

export function rankReferences(references: Reference[], query: SearchQuery): RankedReference[] {
  const candidates = references.filter(({ productionApproved }) => productionApproved).map((reference) => candidateFor(reference, query))
  const strongExact = candidates.filter(({ strongExact }) => strongExact)
  const weakExact = candidates.filter(({ contentMatch, strongExact: strong }) => contentMatch === 'exact' && !strong)
  const compatible = candidates.filter(({ contentMatch }) => contentMatch === 'compatible')
  const fallback = candidates.filter(({ contentMatch }) => contentMatch === 'fallback')
  const incompatible = candidates.filter(({ contentMatch }) => contentMatch === 'incompatible')
  const selected: Candidate[] = []

  if (strongExact.length >= RESULT_LIMIT) {
    appendFrom(selected, strongExact)
  } else {
    appendFrom(selected, strongExact)
    const coverSensitive = query.contentTypeId === 'cover' || isSpeechStoryCoverException(query)
    if (coverSensitive) appendFrom(selected, weakExact)
    const compatibleLimit = coverSensitive ? Math.min(RESULT_LIMIT, selected.length + 1) : RESULT_LIMIT
    appendFrom(selected, compatible, compatibleLimit)
    if (!coverSensitive) appendFrom(selected, weakExact)
    appendFrom(selected, fallback)
    if (selected.length < MIN_RESULTS) appendFrom(selected, incompatible, MIN_RESULTS)
  }

  return selected.map(({ reference, baseScore, matchedKeys, contentMatch, heroEligible }) => ({
    ...reference,
    score: baseScore,
    contentMatch,
    reasons: buildReasons(reference, query, matchedKeys, contentMatch, heroEligible),
  }))
}

export function summarizeContentMatches(results: RankedReference[]) {
  return {
    exactCount: results.filter(({ contentMatch }) => contentMatch === 'exact').length,
    compatibleCount: results.filter(({ contentMatch }) => contentMatch === 'compatible').length,
    fallbackCount: results.filter(({ contentMatch }) => contentMatch === 'fallback' || contentMatch === 'incompatible').length,
  }
}
