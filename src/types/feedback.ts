import type { SearchQuery } from './reference'

export const FEEDBACK_COMMENT_MAX_LENGTH = 4000

export const collectionRatings = ['useful', 'partially_useful', 'not_useful'] as const
export const usableReferenceAnswers = ['yes', 'probably_yes', 'probably_no', 'no'] as const

export type CollectionRating = (typeof collectionRatings)[number]
export type UsableReferenceFound = (typeof usableReferenceAnswers)[number]
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
}

export interface FeedbackSession {
  feedbackSchemaVersion: number
  sessionId: string
  createdAt: string
  completedAt: string | null
  query: SearchQuery | null
  results: FeedbackResult[]
  bestReferenceId: string | null
  noSuitableReference: boolean
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
