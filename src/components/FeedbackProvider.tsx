import { useMemo, useState, type ReactNode } from 'react'
import { FeedbackContext, type FeedbackContextValue } from '../hooks/useFeedback'
import { ACTIVE_SESSION_STORAGE_KEY, clearFeedbackData, createFeedbackSession, readFeedbackSessions, writeFeedbackSessions } from '../services/feedbackStorage'
import type { FeedbackEventType, FeedbackSession, ReferenceFeedback } from '../types/feedback'

function appendEvent(session: FeedbackSession, type: FeedbackEventType, referenceId?: string): FeedbackSession {
  const timestamp = new Date().toISOString()
  const previous = session.events.at(-1)
  if (previous?.type === type && previous.referenceId === referenceId && Date.parse(timestamp) - Date.parse(previous.timestamp) < 1000) return session
  return { ...session, events: [...session.events, { type, timestamp, ...(referenceId ? { referenceId } : {}) }] }
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<FeedbackSession[]>(() => readFeedbackSessions())
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY))

  const commit = (update: (sessions: FeedbackSession[]) => FeedbackSession[]) => {
    setSessions((current) => {
      const next = update(current)
      writeFeedbackSessions(next)
      return next
    })
  }

  const startSession = () => {
    const current = sessions.find(({ sessionId }) => sessionId === activeSessionId)
    if (current && !current.query && !current.completedAt) return current.sessionId
    const session = createFeedbackSession()
    commit((items) => [...items, session])
    setActiveSessionId(session.sessionId)
    localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.sessionId)
    return session.sessionId
  }

  const updateActive = (update: (session: FeedbackSession) => FeedbackSession) => {
    if (!activeSessionId) return
    commit((items) => items.map((session) => session.sessionId === activeSessionId ? update(session) : session))
  }

  const value = useMemo<FeedbackContextValue>(() => ({
    sessions,
    activeSession: sessions.find(({ sessionId }) => sessionId === activeSessionId) ?? null,
    startSession,
    completeWizard: (query, results) => updateActive((session) => {
      const completed = { ...session, query, results: results.slice(0, 6).map(({ id, score }, index) => ({ referenceId: id, rank: index + 1, score })) }
      return appendEvent(appendEvent(completed, 'wizard_completed'), 'results_viewed')
    }),
    selectBestReference: (referenceId) => updateActive((session) => appendEvent({ ...session, bestReferenceId: referenceId }, 'best_reference_selected', referenceId)),
    submitCollectionFeedback: (collectionRating, collectionIssues, collectionComment, usableReferenceFound) => updateActive((session) => appendEvent({
      ...session, collectionRating, collectionIssues, collectionComment, usableReferenceFound, completedAt: new Date().toISOString(),
    }, 'collection_feedback_submitted')),
    submitReferenceFeedback: (feedback: ReferenceFeedback) => updateActive((session) => appendEvent({
      ...session,
      referenceFeedback: [...session.referenceFeedback.filter(({ referenceId }) => referenceId !== feedback.referenceId), feedback],
    }, 'reference_feedback_submitted', feedback.referenceId)),
    recordBoardAction: (referenceId, added) => updateActive((session) => appendEvent({
      ...session,
      boardActions: {
        ...session.boardActions,
        [added ? 'referencesAdded' : 'referencesRemoved']: [...session.boardActions[added ? 'referencesAdded' : 'referencesRemoved'], referenceId],
      },
    }, added ? 'reference_added_to_board' : 'reference_removed_from_board', referenceId)),
    logEvent: (type, referenceId) => updateActive((session) => appendEvent(session, type, referenceId)),
    resetFeedback: () => {
      clearFeedbackData()
      setSessions([])
      setActiveSessionId(null)
    },
  // Context methods intentionally close over the latest persisted state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [sessions, activeSessionId])

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

