import type { SearchQuery } from './reference'
import type { FreshDiscoveryProviderId } from '../data/freshDiscoveryProviders'

export const FEEDBACK_COMMENT_MAX_LENGTH = 4000

export const collectionRatings = ['useful', 'partially_useful', 'not_useful'] as const
export const usableReferenceAnswers = ['yes', 'probably_yes', 'probably_no', 'no'] as const
export const intelligenceHelpfulAnswers = ['helpful', 'partially_helpful', 'not_helpful'] as const
export const freshDiscoveryHelpfulAnswers = ['yes', 'maybe', 'no'] as const
export const freshDiscoveryUsefulReferenceCounts = ['0', '1_2', '3_4', '5_plus'] as const
export const freshDiscoveryVisualQualities = ['strong', 'good', 'average', 'weak'] as const
export const freshDiscoveryLinkQualities = ['all', 'most', 'less_than_half', 'none'] as const
export const freshDiscoveryDiversities = ['diverse', 'some_duplicates', 'too_similar'] as const

export type CollectionRating = (typeof collectionRatings)[number]
export type UsableReferenceFound = (typeof usableReferenceAnswers)[number]
export type IntelligenceHelpful = (typeof intelligenceHelpfulAnswers)[number]
export type FreshDiscoveryHelpful = (typeof freshDiscoveryHelpfulAnswers)[number]
export type FreshDiscoveryUsefulReferenceCount = (typeof freshDiscoveryUsefulReferenceCounts)[number]
export type FreshDiscoveryVisualQuality = (typeof freshDiscoveryVisualQualities)[number]
export type FreshDiscoveryLinkQuality = (typeof freshDiscoveryLinkQualities)[number]
export type FreshDiscoveryDiversity = (typeof freshDiscoveryDiversities)[number]
export type FreshDiscoveryWouldUseAgain = FreshDiscoveryHelpful
export type FreshDiscoveryPromptVersion = 'v2' | 'v3'
export type FeedbackEventType =
  | 'search_started'
  | 'wizard_completed'
  | 'results_viewed'
  | 'reference_opened'
  | 'reference_added_to_board'
  | 'reference_removed_from_board'
  | 'best_reference_selected'
  | 'no_suitable_reference_selected'
  | 'collection_feedback_submitted'
  | 'reference_feedback_submitted'
  | 'content_type_fallback_shown'
  | 'reference_intelligence_opened'
  | 'data_mapping_viewed'
  | 'verified_source_opened'
  | 'missing_reference_prompt_shown'
  | 'missing_reference_submitted'
  | 'intelligence_feedback_submitted'
  | 'fresh_discovery_prompt_shown'
  | 'fresh_discovery_prompt_copied'
  | 'fresh_discovery_feedback_submitted'
  | 'fresh_discovery_provider_selector_opened'
  | 'fresh_discovery_provider_selected'
  | 'fresh_discovery_provider_opened'
  | 'fresh_discovery_provider_open_failed'
  | 'fresh_discovery_prompt_copy_failed'
  | 'fresh_discovery_post_search_feedback_submitted'
  | 'fresh_discovery_test_summary_copied'

export type ResultContentMatchType = 'exact' | 'compatible' | 'fallback'

export interface ResultContentMatch {
  referenceId: string
  matchType: ResultContentMatchType
}

export interface FeedbackResult {
  referenceId: string
  rank: number
  score: number
}

export interface ReferenceFeedback {
  referenceId: string
  useful: boolean
  issues: string[]
  comment: string
}

export interface FeedbackEvent {
  type: FeedbackEventType
  timestamp: string
  referenceId?: string
  selectedContentTypeId?: SearchQuery['contentTypeId']
  exactCount?: number
  compatibleCount?: number
  fallbackCount?: number
  scenarioId?: SearchQuery['scenarioId']
  personaId?: SearchQuery['personaId']
  goalId?: SearchQuery['goalId']
  styleId?: SearchQuery['styleId']
  contentTypeId?: SearchQuery['contentTypeId']
  freshDiscoveryPromptVersion?: FreshDiscoveryPromptVersion
  promptVersion?: FreshDiscoveryPromptVersion
  provider?: FreshDiscoveryProviderId
  providerOpened?: boolean
  usefulReferenceCount?: FreshDiscoveryUsefulReferenceCount | null
  visualQuality?: FreshDiscoveryVisualQuality | null
  wouldUseAgain?: FreshDiscoveryWouldUseAgain | null
  linkQuality?: FreshDiscoveryLinkQuality | null
  diversity?: FreshDiscoveryDiversity | null
}

export interface FeedbackSession {
  feedbackSchemaVersion: number
  sessionId: string
  createdAt: string
  completedAt: string | null
  query: SearchQuery | null
  results: FeedbackResult[]
  resultContentMatch: ResultContentMatch[]
  bestReferenceId: string | null
  noSuitableReference: boolean
  missingReferenceText: string
  intelligenceOpened: boolean
  dataMappingViewed: boolean
  verifiedSourceOpened: boolean
  intelligenceHelpful: IntelligenceHelpful | null
  intelligenceComment: string
  freshDiscoveryPromptShown: boolean
  freshDiscoveryPromptCopied: boolean
  freshDiscoveryHelpful: FreshDiscoveryHelpful | null
  freshDiscoveryPromptVersion?: FreshDiscoveryPromptVersion
  freshDiscoveryProvider: FreshDiscoveryProviderId | null
  freshDiscoveryProviderOpened: boolean
  freshDiscoveryUsefulReferenceCount: FreshDiscoveryUsefulReferenceCount | null
  freshDiscoveryVisualQuality: FreshDiscoveryVisualQuality | null
  freshDiscoveryWouldUseAgain: FreshDiscoveryWouldUseAgain | null
  freshDiscoveryLinkQuality: FreshDiscoveryLinkQuality | null
  freshDiscoveryDiversity: FreshDiscoveryDiversity | null
  collectionRating: CollectionRating | null
  collectionIssues: string[]
  collectionComment: string
  usableReferenceFound: UsableReferenceFound | null
  referenceFeedback: ReferenceFeedback[]
  boardActions: {
    referencesAdded: string[]
    referencesRemoved: string[]
  }
  events: FeedbackEvent[]
}

export interface MissingReferenceFeedback {
  sessionId: string
  createdAt: string
  scenarioId: SearchQuery['scenarioId']
  personaId: SearchQuery['personaId']
  goalId: SearchQuery['goalId']
  styleId: SearchQuery['styleId']
  contentTypeId: SearchQuery['contentTypeId']
  text: string
}
