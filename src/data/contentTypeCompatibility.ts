import type { ContentTypeId, SearchQuery } from '../types/reference'

export interface ContentTypeRule {
  compatible: ContentTypeId[]
  hardIncompatible: ContentTypeId[]
}

export const contentTypeCompatibility: Record<ContentTypeId, ContentTypeRule> = {
  kpi: { compatible: ['dashboard', 'table'], hardIncompatible: ['cover', 'process', 'timeline'] },
  comparison: { compatible: ['table', 'story'], hardIncompatible: ['cover', 'dashboard', 'timeline'] },
  timeline: { compatible: ['process'], hardIncompatible: ['cover', 'table', 'dashboard', 'kpi'] },
  process: { compatible: ['timeline', 'story'], hardIncompatible: ['cover', 'dashboard', 'kpi'] },
  dashboard: { compatible: ['kpi', 'table'], hardIncompatible: ['cover', 'story', 'timeline'] },
  cover: { compatible: ['story'], hardIncompatible: ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'table'] },
  story: { compatible: ['cover', 'comparison', 'process'], hardIncompatible: [] },
  table: { compatible: ['comparison', 'dashboard', 'kpi'], hardIncompatible: ['cover', 'timeline', 'process'] },
}

export function isSpeechStoryCoverException(query: SearchQuery): boolean {
  return query.scenarioId === 'speech' && query.goalId === 'inspire' && query.contentTypeId === 'story'
}

