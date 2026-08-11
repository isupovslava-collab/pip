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
  const freshShownSessions = sessions.filter(({ freshDiscoveryPromptShown }) => freshDiscoveryPromptShown)
  const freshCopiedSessions = sessions.filter(({ freshDiscoveryPromptCopied }) => freshDiscoveryPromptCopied)
  const eventCount = (type: FeedbackSession['events'][number]['type']) => sessions.reduce((count, session) => count + session.events.filter((event) => event.type === type).length, 0)
  const providerSelections = sessions.flatMap(({ events }) => events.filter(({ type }) => type === 'fresh_discovery_provider_selected').flatMap(({ provider }) => provider ? [provider] : []))
  const providerOpened = eventCount('fresh_discovery_provider_opened')
  const providerOpenFailed = eventCount('fresh_discovery_provider_open_failed')
  const usefulFeedbackSessions = sessions.filter(({ freshDiscoveryUsefulReferenceCount }) => freshDiscoveryUsefulReferenceCount)
  const successfulFreshSearches = usefulFeedbackSessions.filter(({ freshDiscoveryUsefulReferenceCount }) => freshDiscoveryUsefulReferenceCount === '3_4' || freshDiscoveryUsefulReferenceCount === '5_plus').length
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
    freshDiscovery: {
      shown: freshShownSessions.length,
      copied: freshCopiedSessions.length,
      copyRate: freshShownSessions.length ? freshCopiedSessions.length / freshShownSessions.length : 0,
      byVersion: frequencies(freshShownSessions.map(({ freshDiscoveryPromptVersion }) => freshDiscoveryPromptVersion ?? 'baseline')),
      byContentType: frequencies(freshCopiedSessions.flatMap(({ query }) => query ? [query.contentTypeId] : [])),
      byScenario: frequencies(freshCopiedSessions.flatMap(({ query }) => query ? [query.scenarioId] : [])),
      helpfulYes: sessions.filter(({ freshDiscoveryHelpful }) => freshDiscoveryHelpful === 'yes').length,
      helpfulMaybe: sessions.filter(({ freshDiscoveryHelpful }) => freshDiscoveryHelpful === 'maybe').length,
      helpfulNo: sessions.filter(({ freshDiscoveryHelpful }) => freshDiscoveryHelpful === 'no').length,
      selectorOpened: eventCount('fresh_discovery_provider_selector_opened'),
      providerShare: frequencies(providerSelections),
      providerOpened,
      providerOpenFailed,
      providerOpenSuccessRate: providerOpened + providerOpenFailed ? providerOpened / (providerOpened + providerOpenFailed) : 0,
      promptCopyFailed: eventCount('fresh_discovery_prompt_copy_failed'),
      postSearchFeedbackSubmitted: eventCount('fresh_discovery_post_search_feedback_submitted'),
      testSummaryCopied: eventCount('fresh_discovery_test_summary_copied'),
      usefulReferences: {
        '0': sessions.filter(({ freshDiscoveryUsefulReferenceCount }) => freshDiscoveryUsefulReferenceCount === '0').length,
        '1_2': sessions.filter(({ freshDiscoveryUsefulReferenceCount }) => freshDiscoveryUsefulReferenceCount === '1_2').length,
        '3_4': sessions.filter(({ freshDiscoveryUsefulReferenceCount }) => freshDiscoveryUsefulReferenceCount === '3_4').length,
        '5_plus': sessions.filter(({ freshDiscoveryUsefulReferenceCount }) => freshDiscoveryUsefulReferenceCount === '5_plus').length,
      },
      wouldUseAgain: {
        yes: sessions.filter(({ freshDiscoveryWouldUseAgain }) => freshDiscoveryWouldUseAgain === 'yes').length,
        maybe: sessions.filter(({ freshDiscoveryWouldUseAgain }) => freshDiscoveryWouldUseAgain === 'maybe').length,
        no: sessions.filter(({ freshDiscoveryWouldUseAgain }) => freshDiscoveryWouldUseAgain === 'no').length,
      },
      visualQuality: {
        strong: sessions.filter(({ freshDiscoveryVisualQuality }) => freshDiscoveryVisualQuality === 'strong').length,
        good: sessions.filter(({ freshDiscoveryVisualQuality }) => freshDiscoveryVisualQuality === 'good').length,
        average: sessions.filter(({ freshDiscoveryVisualQuality }) => freshDiscoveryVisualQuality === 'average').length,
        weak: sessions.filter(({ freshDiscoveryVisualQuality }) => freshDiscoveryVisualQuality === 'weak').length,
      },
      linkQuality: {
        all: sessions.filter(({ freshDiscoveryLinkQuality }) => freshDiscoveryLinkQuality === 'all').length,
        most: sessions.filter(({ freshDiscoveryLinkQuality }) => freshDiscoveryLinkQuality === 'most').length,
        less_than_half: sessions.filter(({ freshDiscoveryLinkQuality }) => freshDiscoveryLinkQuality === 'less_than_half').length,
        none: sessions.filter(({ freshDiscoveryLinkQuality }) => freshDiscoveryLinkQuality === 'none').length,
      },
      diversity: {
        diverse: sessions.filter(({ freshDiscoveryDiversity }) => freshDiscoveryDiversity === 'diverse').length,
        some_duplicates: sessions.filter(({ freshDiscoveryDiversity }) => freshDiscoveryDiversity === 'some_duplicates').length,
        too_similar: sessions.filter(({ freshDiscoveryDiversity }) => freshDiscoveryDiversity === 'too_similar').length,
      },
      successfulSearchRate: usefulFeedbackSessions.length ? successfulFreshSearches / usefulFeedbackSessions.length : 0,
    },
  }
}
