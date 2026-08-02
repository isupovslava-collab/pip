import { labels } from '../data/dictionaries'
import type { ContentTypeId, MatchKey, RankedReference, Reference, SearchQuery } from '../types/reference'

export const RANKING_WEIGHTS: Record<MatchKey, number> = {
  scenarioId: 30,
  personaId: 20,
  goalId: 20,
  styleId: 15,
  contentTypeId: 15,
}

export const HERO_TIE_BREAKER_BONUS = 3
export const HERO_MIN_BASE_SCORE = 60

export const CONTENT_TYPE_COMPATIBILITY: Record<ContentTypeId, ContentTypeId[]> = {
  kpi: ['dashboard', 'table'],
  comparison: ['table', 'story'],
  timeline: ['process', 'story'],
  process: ['timeline', 'story'],
  dashboard: ['kpi', 'table'],
  cover: ['story'],
  story: ['cover', 'comparison'],
  table: ['dashboard', 'kpi', 'comparison'],
}

const COVER_GUARDRAIL_TYPES = new Set<ContentTypeId>(['timeline', 'process', 'dashboard', 'table', 'kpi', 'comparison'])

function isMatch(reference: Reference, query: SearchQuery, key: MatchKey): boolean {
  switch (key) {
    case 'scenarioId': return reference.scenarioIds.includes(query.scenarioId)
    case 'personaId': return reference.personaIds.includes(query.personaId)
    case 'goalId': return reference.goalIds.includes(query.goalId)
    case 'styleId': return reference.styleIds.includes(query.styleId)
    case 'contentTypeId': return reference.contentTypeIds.includes(query.contentTypeId)
  }
}

export function isHardContentMismatch(reference: Reference, query: SearchQuery): boolean {
  if (reference.contentTypeIds.includes(query.contentTypeId)) return false
  if (reference.contentTypeIds.includes('cover') && COVER_GUARDRAIL_TYPES.has(query.contentTypeId)) return true
  if (query.contentTypeId === 'table' && reference.contentTypeIds.includes('timeline')) return true
  if (query.contentTypeId === 'cover' && reference.contentTypeIds.includes('dashboard')) return true
  return false
}

function isCompatible(reference: Reference, query: SearchQuery): boolean {
  return reference.contentTypeIds.some((type) => CONTENT_TYPE_COMPATIBILITY[query.contentTypeId].includes(type))
    || (query.scenarioId === 'speech' && query.goalId === 'inspire' && reference.contentTypeIds.includes('cover'))
}

function semanticPhrase(reference: Reference): string {
  const specificTag = reference.tags.find((tag) => tag.length > 22) ?? reference.category.toLocaleLowerCase('ru')
  return specificTag.replace(/[.]+$/, '')
}

function buildReasons(reference: Reference, query: SearchQuery, matchedKeys: MatchKey[], contentMatch: RankedReference['contentMatch']): string[] {
  const reasons: string[] = []
  if (contentMatch === 'exact') reasons.push(`Точно соответствует формату «${labels.contentType[query.contentTypeId]}»: ${semanticPhrase(reference)}.`)
  if (contentMatch === 'compatible') reasons.push(`Добавлен как близкий формат к «${labels.contentType[query.contentTypeId]}»: ${labels.contentType[reference.contentTypeIds[0]]}.`)
  if (contentMatch === 'semantic-fallback') reasons.push('Добавлен как смысловой fallback: точных и совместимых форматов недостаточно для полной подборки.')
  if (contentMatch === 'hard-fallback') reasons.push('Добавлен только как резервный fallback, потому что релевантных форматов недостаточно для шести результатов.')
  if (reference.qualityTier === 'hero' && reference.productionApproved) reasons.push('Высокая визуальная проработка: одобренный production Hero Reference.')
  if (matchedKeys.includes('scenarioId')) reasons.push(`Создан для сценария «${labels.scenario[query.scenarioId]}» и раскрывает ${semanticPhrase(reference)}.`)
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
}

function candidateFor(reference: Reference, query: SearchQuery): Candidate {
  const matchedKeys = (Object.keys(RANKING_WEIGHTS) as MatchKey[]).filter((key) => isMatch(reference, query, key))
  const baseScore = matchedKeys.reduce((score, key) => score + RANKING_WEIGHTS[key], 0)
  const hard = isHardContentMismatch(reference, query)
  const exact = matchedKeys.includes('contentTypeId')
  const compatible = !hard && isCompatible(reference, query)
  const contentMatch: Candidate['contentMatch'] = exact ? 'exact' : compatible ? 'compatible' : hard ? 'hard-fallback' : 'semantic-fallback'
  const heroEligible = reference.qualityTier === 'hero'
    && reference.productionApproved
    && reference.heroScenarioId === query.scenarioId
    && (exact || compatible)
    && !hard
    && baseScore >= HERO_MIN_BASE_SCORE
  return {
    reference,
    baseScore,
    rankScore: baseScore + (heroEligible ? HERO_TIE_BREAKER_BONUS : 0),
    matchedKeys,
    contentMatch,
    sourceFamily: reference.sourceOrganization ?? reference.sourceType,
  }
}

function contentTier(match: Candidate['contentMatch']): number {
  return match === 'exact' || match === 'compatible' ? 0 : match === 'semantic-fallback' ? 1 : 2
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
  return contentTier(a.contentMatch) - contentTier(b.contentMatch)
    || b.rankScore - a.rankScore
    || a.reference.title.localeCompare(b.reference.title, 'ru')
    || a.reference.id.localeCompare(b.reference.id)
}

function selectDiverse(candidates: Candidate[], limit: number): Candidate[] {
  const remaining = [...candidates]
  const selected: Candidate[] = []
  while (selected.length < limit && remaining.length) {
    remaining.sort((a, b) => {
      const tierDifference = contentTier(a.contentMatch) - contentTier(b.contentMatch)
      if (tierDifference) return tierDifference
      const adjustedA = a.rankScore - similarityPenalty(a, selected)
      const adjustedB = b.rankScore - similarityPenalty(b, selected)
      return adjustedB - adjustedA || deterministicCompare(a, b)
    })
    selected.push(remaining.shift()!)
  }
  return selected
}

export function rankReferences(references: Reference[], query: SearchQuery): RankedReference[] {
  const candidates = references.filter(({ productionApproved }) => productionApproved).map((reference) => candidateFor(reference, query))
  const top = selectDiverse(candidates, Math.min(6, candidates.length))
  const topIds = new Set(top.map(({ reference }) => reference.id))
  const rest = candidates.filter(({ reference }) => !topIds.has(reference.id)).sort(deterministicCompare)
  return [...top, ...rest].map(({ reference, baseScore, matchedKeys, contentMatch }) => ({
    ...reference,
    score: baseScore,
    contentMatch,
    reasons: buildReasons(reference, query, matchedKeys, contentMatch),
  }))
}
