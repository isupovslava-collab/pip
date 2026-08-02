import { describe, expect, it } from 'vitest'
import { summarizeFeedback } from '../services/feedbackAnalytics'
import { createFeedbackSession } from '../services/feedbackStorage'

describe('content precision feedback analytics', () => {
  it('агрегирует exact и fallback sessions без потери старых sessions', () => {
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
})
