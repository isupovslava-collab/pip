export const scenarioIds = ['budget_defense', 'training', 'report', 'meeting', 'project', 'strategy', 'speech', 'idea_pitch'] as const
export const personaIds = ['ceo', 'cfo', 'board', 'manager', 'employees', 'technical_experts', 'team', 'client'] as const
export const goalIds = ['approve', 'decide', 'align', 'explain_results', 'teach', 'explain_problem', 'compare_options', 'inspire'] as const
export const styleIds = ['executive', 'corporate', 'consulting', 'modern', 'industrial', 'minimal'] as const
export const contentTypeIds = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table'] as const

export type ScenarioId = (typeof scenarioIds)[number]
export type PersonaId = (typeof personaIds)[number]
export type GoalId = (typeof goalIds)[number]
export type StyleId = (typeof styleIds)[number]
export type ContentTypeId = (typeof contentTypeIds)[number]

export interface SearchQuery {
  scenarioId: ScenarioId
  personaId: PersonaId
  goalId: GoalId
  styleId: StyleId
  contentTypeId: ContentTypeId
}

export interface DesignDna {
  minimalism: number
  corporate: number
  executive: number
  modern: number
  whitespace: number
  dataDensity: number
  formality: number
  visualComplexity: number
}

export interface Reference {
  id: string
  title: string
  summary: string
  sourceType: 'synthetic'
  sourceLabel: string
  sourceUrl: null
  previewPath: string
  scenarioIds: ScenarioId[]
  personaIds: PersonaId[]
  goalIds: GoalId[]
  styleIds: StyleId[]
  contentTypeIds: ContentTypeId[]
  category: string
  tags: string[]
  useWhen: string[]
  avoidWhen: string[]
  designDna: DesignDna
}

export type MatchKey = keyof SearchQuery

export interface RankedReference extends Reference {
  score: number
  reasons: string[]
}
