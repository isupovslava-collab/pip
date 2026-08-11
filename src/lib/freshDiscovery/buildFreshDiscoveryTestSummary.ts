import { getFreshDiscoveryProvider, type FreshDiscoveryProviderId } from '../../data/freshDiscoveryProviders'
import { labels } from '../../data/dictionaries'
import type { FreshDiscoveryDiversity, FreshDiscoveryLinkQuality, FreshDiscoveryUsefulReferenceCount, FreshDiscoveryVisualQuality, FreshDiscoveryWouldUseAgain } from '../../types/feedback'
import { FRESH_DISCOVERY_PROMPT_VERSION } from './generateFreshDiscoveryPrompt'
import type { SearchQuery } from '../../types/reference'

const usefulLabels: Record<FreshDiscoveryUsefulReferenceCount, string> = { '0': '0', '1_2': '1–2', '3_4': '3–4', '5_plus': '5+' }
const visualLabels: Record<FreshDiscoveryVisualQuality, string> = { strong: 'Сильные / есть WOW', good: 'Хорошие', average: 'Средние', weak: 'Слабые' }
const againLabels: Record<FreshDiscoveryWouldUseAgain, string> = { yes: 'Да', maybe: 'Возможно', no: 'Нет' }

export function buildFreshDiscoveryTestSummary(query: SearchQuery, providerId: FreshDiscoveryProviderId, useful: FreshDiscoveryUsefulReferenceCount | null, visual: FreshDiscoveryVisualQuality | null, again: FreshDiscoveryWouldUseAgain | null, linkQuality: FreshDiscoveryLinkQuality | null = null, diversity: FreshDiscoveryDiversity | null = null): string {
  return `PIP Fresh Discovery Test\n\nPrompt version: ${FRESH_DISCOVERY_PROMPT_VERSION}\nProvider: ${getFreshDiscoveryProvider(providerId).label}\n\nScenario: ${labels.scenario[query.scenarioId]}\nPersona: ${labels.persona[query.personaId]}\nGoal: ${labels.goal[query.goalId]}\nStyle: ${labels.style[query.styleId]}\nContent type: ${labels.contentType[query.contentTypeId]}\n\nUseful references: ${useful ? usefulLabels[useful] : '—'}\nVisual quality: ${visual ? visualLabels[visual] : '—'}\nWould use again: ${again ? againLabels[again] : '—'}\nLink quality: ${linkQuality ?? '—'}\nDiversity: ${diversity ?? '—'}`
}
