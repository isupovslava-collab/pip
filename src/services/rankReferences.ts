import { labels } from '../data/dictionaries'
import type { MatchKey, RankedReference, Reference, SearchQuery } from '../types/reference'

export const RANKING_WEIGHTS: Record<MatchKey, number> = {
  scenarioId: 30,
  personaId: 20,
  goalId: 20,
  styleId: 15,
  contentTypeId: 15,
}

function reasonFor(key: MatchKey, query: SearchQuery): string {
  const reasons: Record<MatchKey, string> = {
    scenarioId: `Сценарий: подходит для задачи «${labels.scenario[query.scenarioId]}»`,
    personaId: `Аудитория: рассчитан на аудиторию «${labels.persona[query.personaId]}»`,
    goalId: `Цель: помогает ${labels.goal[query.goalId].toLocaleLowerCase('ru')}`,
    styleId: `Стиль: соответствует направлению «${labels.style[query.styleId]}»`,
    contentTypeId: `Контент: хорошо подходит для ${labels.contentType[query.contentTypeId]}`,
  }
  return reasons[key]
}

function isMatch(reference: Reference, query: SearchQuery, key: MatchKey): boolean {
  switch (key) {
    case 'scenarioId': return reference.scenarioIds.includes(query.scenarioId)
    case 'personaId': return reference.personaIds.includes(query.personaId)
    case 'goalId': return reference.goalIds.includes(query.goalId)
    case 'styleId': return reference.styleIds.includes(query.styleId)
    case 'contentTypeId': return reference.contentTypeIds.includes(query.contentTypeId)
  }
}

export function rankReferences(references: Reference[], query: SearchQuery): RankedReference[] {
  return references
    .map((reference) => {
      const matchedKeys = (Object.keys(RANKING_WEIGHTS) as MatchKey[]).filter((key) => isMatch(reference, query, key))
      return {
        ...reference,
        score: matchedKeys.reduce((score, key) => score + RANKING_WEIGHTS[key], 0),
        reasons: matchedKeys.map((key) => reasonFor(key, query)),
      }
    })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ru'))
}
