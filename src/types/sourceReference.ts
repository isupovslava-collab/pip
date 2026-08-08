import type { ContentTypeId, GoalId, PersonaId, ScenarioId, StyleId } from './reference'

export const verificationStatuses = ['candidate', 'source_found', 'verified', 'rejected'] as const
export const sourceRightsStatuses = ['public-domain', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'explicit-permission', 'official-embed', 'link-only-no-local-copy', 'unclear'] as const
export const sourceDisplayModes = ['source-link-only', 'official-embed', 'attributed-thumbnail', 'local-asset-allowed', 'pip-interpretation-only'] as const
export const researchOrigins = ['gemini', 'genspark', 'perplexity', 'manual'] as const

export type VerificationStatus = (typeof verificationStatuses)[number]
export type SourceRightsStatus = (typeof sourceRightsStatuses)[number]
export type SourceDisplayMode = (typeof sourceDisplayModes)[number]
export type ResearchOrigin = (typeof researchOrigins)[number]
export type VerificationGate = 'pass' | 'fail'
export type VisualReview = 'approve' | 'revise' | 'reject' | 'awaiting_po_review'
export type PipRelevance = 'high' | 'medium' | 'low'

export interface SourceReference {
  id: string
  verificationStatus: VerificationStatus
  presentationTitle: string
  originalSlideTitle: string | null
  curatorLabel: string | null
  organization: string
  author: string | null
  publicationYear: number | null
  primaryUrl: string
  directDocumentUrl: string | null
  pageNumber: number | null
  slideNumber: number | null
  urlStatus: 'working' | 'partial' | 'broken'
  urlCheckedAt: string
  primaryContentTypeId: ContentTypeId
  compatibleContentTypeIds: ContentTypeId[]
  primaryScenarioId: ScenarioId
  scenarioIds: ScenarioId[]
  personaIds: PersonaId[]
  goalIds: GoalId[]
  styleIds: StyleId[]
  compositionFamily: string
  visualDirection: string
  compositionPrinciple: string
  visualStrength: string
  rightsStatus: SourceRightsStatus
  rightsEvidenceUrl: string | null
  reuseRecommendation: string
  displayMode: SourceDisplayMode
  researchOrigins: ResearchOrigin[]
  duplicateGroupId: string | null
  verificationNotes: string[]
  rejectionReason: string | null
}

export interface SourceVerificationReview {
  sourceReferenceId: string
  sourceGate: VerificationGate
  documentGate: VerificationGate
  pageGate: VerificationGate
  visualGate: VerificationGate
  contentTypeGate: VerificationGate
  scenarioGate: VerificationGate
  rightsGate: VerificationGate
  visualReview: VisualReview
  pipRelevance: PipRelevance
  reviewedAt: string
  notes: string[]
}

export type IntelligenceInputRole =
  | 'headline'
  | 'primary_metric'
  | 'secondary_metrics'
  | 'comparison_items'
  | 'timeline_steps'
  | 'process_steps'
  | 'evidence'
  | 'conclusion'
  | 'call_to_action'
  | 'other'

export interface ReferenceIntelligence {
  referenceId: string
  status: 'pilot' | 'production'
  compositionPrinciple: string
  whyItWorks: Array<{ title: string; explanation: string }>
  visualHierarchy: string[]
  typographyGuidance: string[]
  dataMappingGuide: Array<{ inputRole: IntelligenceInputRole; placement: string; guidance: string }>
  bestFor: string[]
  avoidWhen: string[]
  doNotCopy: string[]
  sourceReferenceIds?: string[]
}
