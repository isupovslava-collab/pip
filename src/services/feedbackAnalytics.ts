import type { FeedbackSession } from '../types/feedback'

function frequencies(values: string[]) {
  return Object.entries(values.reduce<Record<string, number>>((result, value) => ({ ...result, [value]: (result[value] ?? 0) + 1 }), {}))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function summarizeFeedback(sessions: FeedbackSession[]) {
  const rated = sessions.filter(({ collectionRating }) => collectionRating)
  const completed = sessions.filter(({ completedAt }) => completedAt)
  const noSuitableCount = sessions.filter(({ noSuitableReference }) => noSuitableReference).length
  const ratingValues = { useful: 2, partially_useful: 1, not_useful: 0 }
  const precisionSessions = sessions.filter(({ resultContentMatch }) => resultContentMatch.length > 0)
  const exactCounts = precisionSessions.map(({ resultContentMatch }) => resultContentMatch.filter(({ matchType }) => matchType === 'exact').length)
  const fallbackSessions = precisionSessions.filter(({ resultContentMatch }) => resultContentMatch.some(({ matchType }) => matchType !== 'exact'))
  const ratedFallbackSessions = fallbackSessions.filter(({ collectionRating }) => collectionRating)
  const missingReferenceSessions = sessions.filter(({ missingReferenceText }) => missingReferenceText)
  const eventCount = (type: FeedbackSession['events'][number]['type']) => sessions.reduce((count, session) => count + session.events.filter((event) => event.type === type).length, 0)
  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    noSuitableCount,
    noSuitableShare: completed.length ? noSuitableCount / completed.length : 0,
    averageExactResults: exactCounts.length ? exactCounts.reduce((sum, count) => sum + count, 0) / exactCounts.length : null,
    exactAtLeastFourCount: exactCounts.filter((count) => count >= 4).length,
    fallbackSessionCount: fallbackSessions.length,
    fallbackAverageRating: ratedFallbackSessions.length ? ratedFallbackSessions.reduce((sum, session) => sum + ratingValues[session.collectionRating!], 0) / ratedFallbackSessions.length : null,
    fallbackNoSuitableCount: fallbackSessions.filter(({ noSuitableReference }) => noSuitableReference).length,
    averageRating: rated.length ? rated.reduce((sum, session) => sum + ratingValues[session.collectionRating!], 0) / rated.length : null,
    ratings: {
      useful: sessions.filter(({ collectionRating }) => collectionRating === 'useful').length,
      partially_useful: sessions.filter(({ collectionRating }) => collectionRating === 'partially_useful').length,
      not_useful: sessions.filter(({ collectionRating }) => collectionRating === 'not_useful').length,
    },
    usableReferences: {
      yes: sessions.filter(({ usableReferenceFound }) => usableReferenceFound === 'yes').length,
      probably_yes: sessions.filter(({ usableReferenceFound }) => usableReferenceFound === 'probably_yes').length,
      probably_no: sessions.filter(({ usableReferenceFound }) => usableReferenceFound === 'probably_no').length,
      no: sessions.filter(({ usableReferenceFound }) => usableReferenceFound === 'no').length,
    },
    bestReferences: frequencies(sessions.flatMap(({ bestReferenceId }) => bestReferenceId ? [bestReferenceId] : [])),
    boardAdditions: frequencies(sessions.flatMap(({ boardActions }) => boardActions.referencesAdded)),
    issues: frequencies(sessions.flatMap(({ collectionIssues }) => collectionIssues)),
    openedReferences: frequencies(sessions.flatMap(({ events }) => events.filter(({ type }) => type === 'reference_opened').flatMap(({ referenceId }) => referenceId ? [referenceId] : []))),
    intelligence: {
      openedSessions: sessions.filter(({ intelligenceOpened }) => intelligenceOpened).length,
      dataMappingViews: eventCount('data_mapping_viewed'),
      sourceClicks: eventCount('verified_source_opened'),
      helpful: sessions.filter(({ intelligenceHelpful }) => intelligenceHelpful === 'helpful').length,
      partiallyHelpful: sessions.filter(({ intelligenceHelpful }) => intelligenceHelpful === 'partially_helpful').length,
      notHelpful: sessions.filter(({ intelligenceHelpful }) => intelligenceHelpful === 'not_helpful').length,
      comments: sessions.flatMap(({ intelligenceComment, sessionId }) => intelligenceComment ? [[sessionId, intelligenceComment] as [string, string]] : []),
    },
    missingReferences: {
      submissions: missingReferenceSessions.length,
      byContentType: frequencies(missingReferenceSessions.flatMap(({ query }) => query ? [query.contentTypeId] : [])),
      byScenario: frequencies(missingReferenceSessions.flatMap(({ query }) => query ? [query.scenarioId] : [])),
      byStyle: frequencies(missingReferenceSessions.flatMap(({ query }) => query ? [query.styleId] : [])),
      raw: missingReferenceSessions.map(({ sessionId, missingReferenceText }) => [sessionId, missingReferenceText] as [string, string]),
    },
  }
}
