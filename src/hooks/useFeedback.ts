import { createContext, useContext } from 'react'
import type { CollectionRating, FeedbackEventType, FeedbackSession, ReferenceFeedback, UsableReferenceFound } from '../types/feedback'
import type { RankedReference, SearchQuery } from '../types/reference'

export interface FeedbackContextValue {
  sessions: FeedbackSession[]
  activeSession: FeedbackSession | null
  startSession: () => string
  completeWizard: (query: SearchQuery, results: RankedReference[]) => void
  selectBestReference: (referenceId: string) => void
  selectNoSuitableReference: () => void
  submitCollectionFeedback: (rating: CollectionRating, issues: string[], comment: string, usableReferenceFound: UsableReferenceFound) => void
  submitReferenceFeedback: (feedback: ReferenceFeedback) => void
  recordBoardAction: (referenceId: string, added: boolean) => void
  logEvent: (type: FeedbackEventType, referenceId?: string) => void
  resetFeedback: () => void
}

const noop = () => undefined
const fallback: FeedbackContextValue = {
  sessions: [], activeSession: null, startSession: () => '', completeWizard: noop, selectBestReference: noop, selectNoSuitableReference: noop,
  submitCollectionFeedback: noop, submitReferenceFeedback: noop, recordBoardAction: noop, logEvent: noop, resetFeedback: noop,
}

export const FeedbackContext = createContext<FeedbackContextValue>(fallback)
export function useFeedback() { return useContext(FeedbackContext) }
