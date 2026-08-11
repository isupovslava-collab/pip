export const scenarioIds = ['sales', 'speech', 'project', 'meeting', 'report', 'training', 'strategy', 'budget_defense'] as const
export const personaIds = ['ceo', 'cfo', 'board', 'manager', 'employees', 'technical_experts', 'team', 'client'] as const
export const goalIds = ['approve', 'decide', 'align', 'explain_results', 'teach', 'explain_problem', 'compare_options', 'inspire'] as const
export const styleIds = ['executive', 'corporate', 'consulting', 'modern', 'industrial', 'minimal'] as const
export const contentTypeIds = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table'] as const

export type ScenarioId = (typeof scenarioIds)[number]
export type PersonaId = (typeof personaIds)[number]
export type GoalId = (typeof goalIds)[number]
export type StyleId = (typeof styleIds)[number]
export type ContentTypeId = (typeof contentTypeIds)[number]
export type RightsStatus = 'public-link-reference-only' | 'licensed-for-reuse' | 'public-domain' | 'cc-licensed' | 'unknown-link-only'
export type PreviewMode = 'original_pip_interpretation' | 'licensed_original_preview'
export type QualityTier = 'hero' | 'gold' | 'standard' | 'prototype'
export type CuratedCoreStatus = 'eligible' | 'review_only' | 'excluded'
export type VisualReferenceQuality = 'premium' | 'good' | 'schematic' | 'prototype' | 'unknown'

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
  sourceType: string
  sourceLabel: string
  sourceUrl: string | null
  sourceBacked: boolean
  sourceTitle: string | null
  sourceOrganization: string | null
  rightsStatus: RightsStatus | null
  sourceNotes: string | null
  sourceAccessCheckedAt: string | null
  previewMode: PreviewMode
  qualityTier: QualityTier
  primaryContentTypeId: ContentTypeId
  screenSuitable: boolean
  visualReferenceQuality: VisualReferenceQuality
  curatedCoreStatus: CuratedCoreStatus
  productionApproved: boolean
  heroScenarioId: ScenarioId | null
  compositionFamily: string
  visualDirection: string
  referenceSchemaVersion: number
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
  contentMatch: 'exact' | 'compatible' | 'fallback' | 'incompatible'
}
