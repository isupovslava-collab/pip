import { describe, expect, it } from 'vitest'
import { summarizeFeedback } from '../services/feedbackAnalytics'
import { createFeedbackSession } from '../services/feedbackStorage'

describe('feedback analytics', () => {
  it('aggregates exact and fallback sessions without losing legacy sessions', () => {
    const exact = createFeedbackSession('2026-08-02T00:00:00.000Z', 'PIP-TEST-PRECISION1')
    exact.resultContentMatch = Array.from({ length: 6 }, (_, index) => ({ referenceId: `REF-${index}`, matchType: 'exact' as const }))
    const fallback = createFeedbackSession('2026-08-02T00:01:00.000Z', 'PIP-TEST-PRECISION2')
    fallback.resultContentMatch = [
      { referenceId: 'REF-1', matchType: 'exact' }, { referenceId: 'REF-2', matchType: 'exact' },
      { referenceId: 'REF-3', matchType: 'compatible' }, { referenceId: 'REF-4', matchType: 'fallback' },
    ]
    fallback.collectionRating = 'partially_useful'
    fallback.noSuitableReference = true
    const legacy = createFeedbackSession('2026-08-02T00:02:00.000Z', 'PIP-TEST-PRECISION3')
    const summary = summarizeFeedback([exact, fallback, legacy])
    expect(summary.averageExactResults).toBe(4)
    expect(summary.exactAtLeastFourCount).toBe(1)
    expect(summary.fallbackSessionCount).toBe(1)
    expect(summary.fallbackAverageRating).toBe(1)
    expect(summary.fallbackNoSuitableCount).toBe(1)
  })

  it('aggregates Fresh Discovery shown, copied, context and helpfulness', () => {
    const shown = createFeedbackSession('2026-08-08T00:00:00.000Z', 'PIP-TEST-FRESH-A')
    shown.query = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'modern', contentTypeId: 'comparison' }
    shown.freshDiscoveryPromptShown = true
    delete shown.freshDiscoveryPromptVersion
    const copied = createFeedbackSession('2026-08-08T00:01:00.000Z', 'PIP-TEST-FRESH-B')
    copied.query = { scenarioId: 'report', personaId: 'ceo', goalId: 'explain_results', styleId: 'executive', contentTypeId: 'dashboard' }
    copied.freshDiscoveryPromptShown = true
    copied.freshDiscoveryPromptCopied = true
    copied.freshDiscoveryHelpful = 'yes'
    const summary = summarizeFeedback([shown, copied]).freshDiscovery
    expect(summary).toMatchObject({ shown: 2, copied: 1, copyRate: 0.5, helpfulYes: 1, helpfulMaybe: 0, helpfulNo: 0 })
    expect(summary.byContentType).toEqual([['dashboard', 1]])
    expect(summary.byScenario).toEqual([['report', 1]])
    expect(summary.byVersion).toEqual([['baseline', 1], ['v2', 1]])
  })
})
