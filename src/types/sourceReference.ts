import type { ContentTypeId, GoalId, PersonaId, ScenarioId, StyleId } from './reference'

export const sourceVerificationStatuses = ['candidate', 'source_found', 'source_verified', 'source_rejected'] as const
export const pipProductReviewStatuses = ['awaiting_po_review', 'pip_approved', 'pip_rejected'] as const
export const sourceRightsStatuses = ['public-domain', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'explicit-permission', 'other-open-licence', 'official-embed', 'link-only-no-local-copy', 'unclear'] as const
export const sourceDisplayModes = ['source-link-only', 'official-embed', 'attributed-thumbnail', 'local-asset-allowed', 'pip-interpretation-only'] as const
export const researchOrigins = ['gemini', 'genspark', 'perplexity', 'manual'] as const

export type SourceVerificationStatus = (typeof sourceVerificationStatuses)[number]
export type PipProductReviewStatus = (typeof pipProductReviewStatuses)[number]
export type SourceRightsStatus = (typeof sourceRightsStatuses)[number]
export type SourceDisplayMode = (typeof sourceDisplayModes)[number]
export type ResearchOrigin = (typeof researchOrigins)[number]
export type VerificationGate = 'pass' | 'fail'
export type ReviewSignal = 'pass' | 'warning' | 'fail'
export type DesignFreshness = 'current' | 'still_relevant' | 'dated' | 'not_assessed'
export type SourceStability = 'high' | 'medium' | 'low' | 'unknown'
export type ProductRejectionReason = 'visual_too_simple' | 'visually_dated' | 'document_like' | 'screen_unsuitable' | 'semantic_mismatch' | 'low_inspiration' | 'weak_composition' | 'rights_issue' | 'duplicate' | 'other'

export interface SourceReference {
  id: string
  sourceVerificationStatus: SourceVerificationStatus
  pipProductReviewStatus: PipProductReviewStatus
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
  licenseName: string | null
  rightsEvidenceUrl: string | null
  reuseRecommendation: string
  displayMode: SourceDisplayMode
  sourceStability: SourceStability
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
  reviewedAt: string
  notes: string[]
}

export interface PipProductReview {
  sourceReferenceId: string
  semanticFit: ReviewSignal
  visualInspiration: ReviewSignal
  screenSuitability: ReviewSignal
  designFreshness: DesignFreshness
  pipProductReviewStatus: PipProductReviewStatus
  poReviewedAt: string | null
  poNotes: string[]
  rejectionReasons: ProductRejectionReason[]
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
