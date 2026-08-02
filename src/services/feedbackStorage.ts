import type { FeedbackSession } from '../types/feedback'

export const FEEDBACK_STORAGE_KEY = 'pipFeedbackSessions'
export const ACTIVE_SESSION_STORAGE_KEY = 'pipFeedbackActiveSessionId'

const CSV_HEADERS = [
  'sessionId', 'createdAt', 'scenario', 'persona', 'goal', 'style', 'contentType',
  ...Array.from({ length: 6 }, (_, index) => [`result${index + 1}Id`, `result${index + 1}Score`]).flat(),
  'exactResultCount', 'compatibleResultCount', 'fallbackResultCount', 'fallbackShown',
  'bestReferenceId', 'noSuitableReference', 'collectionRating', 'usableReferenceFound', 'collectionIssues', 'collectionComment',
  'boardAddedCount', 'referencePositiveCount', 'referenceNegativeCount',
]

export function createSessionId(randomValues: Uint8Array = crypto.getRandomValues(new Uint8Array(4))): string {
  return `PIP-TEST-${Array.from(randomValues, (value) => value.toString(16).padStart(2, '0')).join('').toUpperCase()}`
}

export function createFeedbackSession(now = new Date().toISOString(), sessionId = createSessionId()): FeedbackSession {
  return {
    feedbackSchemaVersion: 2,
    sessionId,
    createdAt: now,
    completedAt: null,
    query: null,
    results: [],
    resultContentMatch: [],
    bestReferenceId: null,
    noSuitableReference: false,
    collectionRating: null,
    collectionIssues: [],
    collectionComment: '',
    usableReferenceFound: null,
    referenceFeedback: [],
    boardActions: { referencesAdded: [], referencesRemoved: [] },
    events: [{ type: 'search_started', timestamp: now }],
  }
}

export function readFeedbackSessions(storage: Storage = localStorage): FeedbackSession[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(FEEDBACK_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) throw new Error('Feedback data must be an array.')
    return parsed.filter((session): session is FeedbackSession => Boolean(
      session && typeof session === 'object' && typeof (session as FeedbackSession).sessionId === 'string',
    )).map((session) => ({
      ...session,
      feedbackSchemaVersion: session.feedbackSchemaVersion ?? 2,
      noSuitableReference: session.noSuitableReference ?? false,
      resultContentMatch: session.resultContentMatch ?? [],
    }))
  } catch {
    storage.removeItem(FEEDBACK_STORAGE_KEY)
    storage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
    return []
  }
}

export function writeFeedbackSessions(sessions: FeedbackSession[], storage: Storage = localStorage): void {
  storage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(sessions))
}

export function exportFeedbackJson(sessions: FeedbackSession[]): string {
  return `${JSON.stringify(sessions, null, 2)}\n`
}

function csvCell(value: unknown): string {
  const stringValue = String(value ?? '')
  return /[",\n\r;]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue
}

export function exportFeedbackCsv(sessions: FeedbackSession[]): string {
  const rows = sessions.map((session) => {
    const resultCells = Array.from({ length: 6 }, (_, index) => [session.results[index]?.referenceId ?? '', session.results[index]?.score ?? '']).flat()
    const positive = session.referenceFeedback.filter(({ useful }) => useful).length
    const negative = session.referenceFeedback.length - positive
    const exactResultCount = session.resultContentMatch.filter(({ matchType }) => matchType === 'exact').length
    const compatibleResultCount = session.resultContentMatch.filter(({ matchType }) => matchType === 'compatible').length
    const fallbackResultCount = session.resultContentMatch.filter(({ matchType }) => matchType === 'fallback').length
    return [
      session.sessionId,
      session.createdAt,
      session.query?.scenarioId,
      session.query?.personaId,
      session.query?.goalId,
      session.query?.styleId,
      session.query?.contentTypeId,
      ...resultCells,
      exactResultCount,
      compatibleResultCount,
      fallbackResultCount,
      compatibleResultCount + fallbackResultCount > 0,
      session.bestReferenceId,
      session.noSuitableReference,
      session.collectionRating,
      session.usableReferenceFound,
      session.collectionIssues.join(' | '),
      session.collectionComment,
      session.boardActions.referencesAdded.length,
      positive,
      negative,
    ].map(csvCell).join(',')
  })
  return `\uFEFF${CSV_HEADERS.join(',')}\r\n${rows.join('\r\n')}\r\n`
}

export function clearFeedbackData(storage: Storage = localStorage): void {
  storage.removeItem(FEEDBACK_STORAGE_KEY)
  storage.removeItem(ACTIVE_SESSION_STORAGE_KEY)
}
