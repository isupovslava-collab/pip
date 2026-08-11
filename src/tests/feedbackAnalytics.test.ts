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
    expect(summary.byVersion).toEqual([['baseline', 1], ['v3', 1]])
  })

  it('aggregates provider handoff and self-reported successful searches', () => {
    const successful = createFeedbackSession('2026-08-09T00:00:00.000Z', 'PIP-TEST-FRESH25-A')
    successful.freshDiscoveryProvider = 'chatgpt'
    successful.freshDiscoveryProviderOpened = true
    successful.freshDiscoveryUsefulReferenceCount = '3_4'
    successful.freshDiscoveryVisualQuality = 'good'
    successful.freshDiscoveryWouldUseAgain = 'yes'
    successful.freshDiscoveryLinkQuality = 'all'
    successful.freshDiscoveryDiversity = 'diverse'
    successful.events.push(
      { type: 'fresh_discovery_provider_selector_opened', timestamp: '2026-08-09T00:01:00.000Z' },
      { type: 'fresh_discovery_provider_selected', timestamp: '2026-08-09T00:01:01.000Z', provider: 'chatgpt' },
      { type: 'fresh_discovery_provider_opened', timestamp: '2026-08-09T00:01:02.000Z', provider: 'chatgpt', providerOpened: true },
      { type: 'fresh_discovery_post_search_feedback_submitted', timestamp: '2026-08-09T00:02:00.000Z', provider: 'chatgpt', usefulReferenceCount: '3_4', visualQuality: 'good', wouldUseAgain: 'yes' },
    )
    const failed = createFeedbackSession('2026-08-09T01:00:00.000Z', 'PIP-TEST-FRESH25-B')
    failed.freshDiscoveryProvider = 'gemini'
    failed.freshDiscoveryUsefulReferenceCount = '1_2'
    failed.freshDiscoveryWouldUseAgain = 'maybe'
    failed.events.push(
      { type: 'fresh_discovery_provider_selected', timestamp: '2026-08-09T01:01:00.000Z', provider: 'gemini' },
      { type: 'fresh_discovery_provider_open_failed', timestamp: '2026-08-09T01:01:01.000Z', provider: 'gemini', providerOpened: false },
    )
    const summary = summarizeFeedback([successful, failed]).freshDiscovery
    expect(summary.providerShare).toEqual([['chatgpt', 1], ['gemini', 1]])
    expect(summary.providerOpenSuccessRate).toBe(0.5)
    expect(summary.successfulSearchRate).toBe(0.5)
    expect(summary.usefulReferences).toMatchObject({ '1_2': 1, '3_4': 1 })
    expect(summary.wouldUseAgain).toMatchObject({ yes: 1, maybe: 1, no: 0 })
    expect(summary.visualQuality.good).toBe(1)
    expect(summary.linkQuality.all).toBe(1)
    expect(summary.diversity.diverse).toBe(1)
  })
})
