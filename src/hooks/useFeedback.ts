import { createContext, useContext } from 'react'
import type { CollectionRating, FeedbackEventType, FeedbackSession, FreshDiscoveryDiversity, FreshDiscoveryHelpful, FreshDiscoveryLinkQuality, FreshDiscoveryUsefulReferenceCount, FreshDiscoveryVisualQuality, FreshDiscoveryWouldUseAgain, IntelligenceHelpful, ReferenceFeedback, UsableReferenceFound } from '../types/feedback'
import type { FreshDiscoveryProviderId } from '../data/freshDiscoveryProviders'
import type { RankedReference, SearchQuery } from '../types/reference'

export interface FeedbackContextValue {
  sessions: FeedbackSession[]
  activeSession: FeedbackSession | null
  startSession: () => string
  completeWizard: (query: SearchQuery, results: RankedReference[]) => void
  selectBestReference: (referenceId: string) => void
  selectNoSuitableReference: () => void
  submitMissingReferenceFeedback: (text: string) => void
  submitIntelligenceFeedback: (referenceId: string, helpful: IntelligenceHelpful, comment: string) => void
  recordFreshDiscoveryPromptShown: (query: SearchQuery) => void
  recordFreshDiscoveryPromptCopied: (query: SearchQuery) => void
  recordFreshDiscoveryProviderEvent: (type: 'fresh_discovery_provider_selector_opened' | 'fresh_discovery_provider_selected' | 'fresh_discovery_provider_opened' | 'fresh_discovery_provider_open_failed' | 'fresh_discovery_prompt_copy_failed', query: SearchQuery, provider?: FreshDiscoveryProviderId) => void
  recordFreshDiscoveryTestSummaryCopied: (query: SearchQuery, provider: FreshDiscoveryProviderId) => void
  submitFreshDiscoveryFeedback: (helpful: FreshDiscoveryHelpful) => void
  submitFreshDiscoveryPostSearchFeedback: (usefulReferenceCount: FreshDiscoveryUsefulReferenceCount | null, visualQuality: FreshDiscoveryVisualQuality | null, wouldUseAgain: FreshDiscoveryWouldUseAgain | null, linkQuality: FreshDiscoveryLinkQuality | null, diversity: FreshDiscoveryDiversity | null) => void
  submitCollectionFeedback: (rating: CollectionRating, issues: string[], comment: string, usableReferenceFound: UsableReferenceFound) => void
  submitReferenceFeedback: (feedback: ReferenceFeedback) => void
  recordBoardAction: (referenceId: string, added: boolean) => void
  logEvent: (type: FeedbackEventType, referenceId?: string) => void
  resetFeedback: () => void
}

const noop = () => undefined
const fallback: FeedbackContextValue = {
  sessions: [], activeSession: null, startSession: () => '', completeWizard: noop, selectBestReference: noop, selectNoSuitableReference: noop,
  submitMissingReferenceFeedback: noop, submitIntelligenceFeedback: noop, recordFreshDiscoveryPromptShown: noop, recordFreshDiscoveryPromptCopied: noop, recordFreshDiscoveryProviderEvent: noop, recordFreshDiscoveryTestSummaryCopied: noop, submitFreshDiscoveryFeedback: noop, submitFreshDiscoveryPostSearchFeedback: noop, submitCollectionFeedback: noop, submitReferenceFeedback: noop, recordBoardAction: noop, logEvent: noop, resetFeedback: noop,
}

export const FeedbackContext = createContext<FeedbackContextValue>(fallback)
export function useFeedback() { return useContext(FeedbackContext) }
