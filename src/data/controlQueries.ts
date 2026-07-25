import type { SearchQuery } from '../types/reference'

export interface ControlQuery extends SearchQuery {
  id: string
  minimumScore: number
}

export const controlQueries: ControlQuery[] = [
  {"id":"sales-client-approval","scenarioId":"sales","personaId":"client","goalId":"approve","styleId":"consulting","contentTypeId":"comparison","minimumScore":100},
  {"id":"sales-ceo-decision","scenarioId":"sales","personaId":"ceo","goalId":"decide","styleId":"executive","contentTypeId":"kpi","minimumScore":100},
  {"id":"sales-client-story","scenarioId":"sales","personaId":"client","goalId":"compare_options","styleId":"modern","contentTypeId":"story","minimumScore":100},
  {"id":"speech-employees-inspiration","scenarioId":"speech","personaId":"employees","goalId":"inspire","styleId":"modern","contentTypeId":"story","minimumScore":100},
  {"id":"speech-board-alignment","scenarioId":"speech","personaId":"board","goalId":"align","styleId":"minimal","contentTypeId":"cover","minimumScore":100},
  {"id":"speech-client-inspiration","scenarioId":"speech","personaId":"client","goalId":"inspire","styleId":"corporate","contentTypeId":"story","minimumScore":100},
  {"id":"project-board-approval","scenarioId":"project","personaId":"board","goalId":"approve","styleId":"executive","contentTypeId":"comparison","minimumScore":100},
  {"id":"project-technical-problem","scenarioId":"project","personaId":"technical_experts","goalId":"explain_problem","styleId":"industrial","contentTypeId":"process","minimumScore":100},
  {"id":"project-manager-roadmap","scenarioId":"project","personaId":"manager","goalId":"decide","styleId":"consulting","contentTypeId":"timeline","minimumScore":100},
  {"id":"meeting-team-alignment","scenarioId":"meeting","personaId":"team","goalId":"align","styleId":"modern","contentTypeId":"process","minimumScore":100},
  {"id":"meeting-manager-decision","scenarioId":"meeting","personaId":"manager","goalId":"decide","styleId":"corporate","contentTypeId":"dashboard","minimumScore":100},
  {"id":"meeting-technical-alignment","scenarioId":"meeting","personaId":"technical_experts","goalId":"align","styleId":"industrial","contentTypeId":"table","minimumScore":100},
  {"id":"report-manager-kpi","scenarioId":"report","personaId":"manager","goalId":"explain_results","styleId":"corporate","contentTypeId":"kpi","minimumScore":100},
  {"id":"report-cfo-dashboard","scenarioId":"report","personaId":"cfo","goalId":"explain_results","styleId":"executive","contentTypeId":"dashboard","minimumScore":100},
  {"id":"report-technical-table","scenarioId":"report","personaId":"technical_experts","goalId":"explain_problem","styleId":"industrial","contentTypeId":"table","minimumScore":100},
  {"id":"training-employees-process","scenarioId":"training","personaId":"employees","goalId":"teach","styleId":"modern","contentTypeId":"process","minimumScore":100},
  {"id":"training-team-timeline","scenarioId":"training","personaId":"team","goalId":"teach","styleId":"corporate","contentTypeId":"timeline","minimumScore":100},
  {"id":"training-technical-story","scenarioId":"training","personaId":"technical_experts","goalId":"explain_problem","styleId":"minimal","contentTypeId":"story","minimumScore":100},
  {"id":"strategy-ceo-roadmap","scenarioId":"strategy","personaId":"ceo","goalId":"decide","styleId":"consulting","contentTypeId":"timeline","minimumScore":100},
  {"id":"strategy-board-alignment","scenarioId":"strategy","personaId":"board","goalId":"align","styleId":"executive","contentTypeId":"timeline","minimumScore":100},
  {"id":"strategy-manager-comparison","scenarioId":"strategy","personaId":"manager","goalId":"compare_options","styleId":"corporate","contentTypeId":"comparison","minimumScore":100},
  {"id":"budget-cfo-approval","scenarioId":"budget_defense","personaId":"cfo","goalId":"approve","styleId":"executive","contentTypeId":"table","minimumScore":100},
  {"id":"budget-board-decision","scenarioId":"budget_defense","personaId":"board","goalId":"decide","styleId":"corporate","contentTypeId":"comparison","minimumScore":100},
  {"id":"budget-ceo-kpi","scenarioId":"budget_defense","personaId":"ceo","goalId":"approve","styleId":"consulting","contentTypeId":"kpi","minimumScore":100},
]
