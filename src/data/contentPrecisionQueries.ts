import type { ContentTypeId, SearchQuery } from '../types/reference'

export interface ContentPrecisionQuery extends SearchQuery { id: string }

export const contentPrecisionQueries: ContentPrecisionQuery[] = [
  { id: 'precision-kpi-report', scenarioId: 'report', personaId: 'manager', goalId: 'explain_results', styleId: 'corporate', contentTypeId: 'kpi' },
  { id: 'precision-kpi-budget', scenarioId: 'budget_defense', personaId: 'cfo', goalId: 'approve', styleId: 'executive', contentTypeId: 'kpi' },
  { id: 'precision-kpi-sales', scenarioId: 'sales', personaId: 'ceo', goalId: 'decide', styleId: 'consulting', contentTypeId: 'kpi' },
  { id: 'precision-comparison-sales', scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' },
  { id: 'precision-comparison-project', scenarioId: 'project', personaId: 'board', goalId: 'approve', styleId: 'executive', contentTypeId: 'comparison' },
  { id: 'precision-comparison-strategy', scenarioId: 'strategy', personaId: 'board', goalId: 'compare_options', styleId: 'executive', contentTypeId: 'comparison' },
  { id: 'precision-timeline-strategy', scenarioId: 'strategy', personaId: 'ceo', goalId: 'decide', styleId: 'consulting', contentTypeId: 'timeline' },
  { id: 'precision-timeline-project', scenarioId: 'project', personaId: 'manager', goalId: 'decide', styleId: 'consulting', contentTypeId: 'timeline' },
  { id: 'precision-timeline-training', scenarioId: 'training', personaId: 'team', goalId: 'teach', styleId: 'corporate', contentTypeId: 'timeline' },
  { id: 'precision-process-training', scenarioId: 'training', personaId: 'employees', goalId: 'teach', styleId: 'modern', contentTypeId: 'process' },
  { id: 'precision-process-meeting', scenarioId: 'meeting', personaId: 'team', goalId: 'align', styleId: 'modern', contentTypeId: 'process' },
  { id: 'precision-process-project', scenarioId: 'project', personaId: 'technical_experts', goalId: 'explain_problem', styleId: 'industrial', contentTypeId: 'process' },
  { id: 'precision-dashboard-report-board', scenarioId: 'report', personaId: 'board', goalId: 'explain_results', styleId: 'executive', contentTypeId: 'dashboard' },
  { id: 'precision-dashboard-report-cfo', scenarioId: 'report', personaId: 'cfo', goalId: 'explain_results', styleId: 'executive', contentTypeId: 'dashboard' },
  { id: 'precision-dashboard-meeting', scenarioId: 'meeting', personaId: 'manager', goalId: 'align', styleId: 'corporate', contentTypeId: 'dashboard' },
  { id: 'precision-cover-speech-employees', scenarioId: 'speech', personaId: 'employees', goalId: 'inspire', styleId: 'minimal', contentTypeId: 'cover' },
  { id: 'precision-cover-speech-board', scenarioId: 'speech', personaId: 'board', goalId: 'inspire', styleId: 'minimal', contentTypeId: 'cover' },
  { id: 'precision-cover-sales', scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'modern', contentTypeId: 'cover' },
  { id: 'precision-story-speech', scenarioId: 'speech', personaId: 'client', goalId: 'inspire', styleId: 'modern', contentTypeId: 'story' },
  { id: 'precision-story-sales', scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'story' },
  { id: 'precision-story-training', scenarioId: 'training', personaId: 'employees', goalId: 'teach', styleId: 'modern', contentTypeId: 'story' },
  { id: 'precision-table-budget', scenarioId: 'budget_defense', personaId: 'cfo', goalId: 'approve', styleId: 'executive', contentTypeId: 'table' },
  { id: 'precision-table-meeting', scenarioId: 'meeting', personaId: 'technical_experts', goalId: 'align', styleId: 'industrial', contentTypeId: 'table' },
  { id: 'precision-table-report', scenarioId: 'report', personaId: 'technical_experts', goalId: 'explain_problem', styleId: 'industrial', contentTypeId: 'table' },
]

export const contentPrecisionQueryCounts = contentPrecisionQueries.reduce<Record<ContentTypeId, number>>((counts, query) => {
  counts[query.contentTypeId] += 1
  return counts
}, { kpi: 0, comparison: 0, timeline: 0, process: 0, dashboard: 0, cover: 0, story: 0, table: 0 })

