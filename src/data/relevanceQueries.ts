import type { SearchQuery } from '../types/reference'

export interface RelevanceQuery extends SearchQuery { id: string }

export const relevanceQueries: RelevanceQuery[] = [
  { id: 'r-sales-comparison', scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' },
  { id: 'r-sales-story', scenarioId: 'sales', personaId: 'ceo', goalId: 'decide', styleId: 'modern', contentTypeId: 'story' },
  { id: 'r-speech-story', scenarioId: 'speech', personaId: 'employees', goalId: 'inspire', styleId: 'modern', contentTypeId: 'story' },
  { id: 'r-speech-cover', scenarioId: 'speech', personaId: 'board', goalId: 'inspire', styleId: 'minimal', contentTypeId: 'cover' },
  { id: 'r-project-comparison', scenarioId: 'project', personaId: 'board', goalId: 'approve', styleId: 'executive', contentTypeId: 'comparison' },
  { id: 'r-project-timeline', scenarioId: 'project', personaId: 'manager', goalId: 'decide', styleId: 'consulting', contentTypeId: 'timeline' },
  { id: 'r-meeting-process', scenarioId: 'meeting', personaId: 'team', goalId: 'align', styleId: 'modern', contentTypeId: 'process' },
  { id: 'r-meeting-table', scenarioId: 'meeting', personaId: 'technical_experts', goalId: 'align', styleId: 'industrial', contentTypeId: 'table' },
  { id: 'r-report-kpi', scenarioId: 'report', personaId: 'manager', goalId: 'explain_results', styleId: 'corporate', contentTypeId: 'kpi' },
  { id: 'r-report-dashboard', scenarioId: 'report', personaId: 'cfo', goalId: 'explain_results', styleId: 'executive', contentTypeId: 'dashboard' },
  { id: 'r-training-process', scenarioId: 'training', personaId: 'employees', goalId: 'teach', styleId: 'modern', contentTypeId: 'process' },
  { id: 'r-training-timeline', scenarioId: 'training', personaId: 'team', goalId: 'teach', styleId: 'corporate', contentTypeId: 'timeline' },
  { id: 'r-strategy-timeline', scenarioId: 'strategy', personaId: 'ceo', goalId: 'decide', styleId: 'consulting', contentTypeId: 'timeline' },
  { id: 'r-strategy-comparison', scenarioId: 'strategy', personaId: 'board', goalId: 'compare_options', styleId: 'executive', contentTypeId: 'comparison' },
  { id: 'r-budget-table', scenarioId: 'budget_defense', personaId: 'cfo', goalId: 'approve', styleId: 'executive', contentTypeId: 'table' },
  { id: 'r-budget-kpi', scenarioId: 'budget_defense', personaId: 'ceo', goalId: 'approve', styleId: 'consulting', contentTypeId: 'kpi' },
]

export const relevanceQueryPairs: Array<[string, string]> = [
  ['r-sales-comparison', 'r-speech-story'],
  ['r-sales-story', 'r-training-process'],
  ['r-speech-cover', 'r-report-kpi'],
  ['r-speech-story', 'r-budget-table'],
  ['r-project-comparison', 'r-meeting-process'],
  ['r-project-timeline', 'r-report-dashboard'],
  ['r-meeting-table', 'r-training-timeline'],
  ['r-meeting-process', 'r-budget-kpi'],
  ['r-report-kpi', 'r-training-process'],
  ['r-report-dashboard', 'r-strategy-timeline'],
  ['r-training-process', 'r-budget-table'],
  ['r-training-timeline', 'r-sales-comparison'],
  ['r-strategy-timeline', 'r-budget-table'],
  ['r-strategy-comparison', 'r-speech-cover'],
  ['r-budget-kpi', 'r-project-timeline'],
  ['r-budget-table', 'r-sales-story'],
]
