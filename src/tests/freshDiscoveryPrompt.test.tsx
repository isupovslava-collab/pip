import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { FreshDiscoveryPrompt } from '../components/FreshDiscoveryPrompt'
import { FreshDiscoveryProviderSelector } from '../components/FreshDiscoveryProviderSelector'
import { FRESH_DISCOVERY_PROMPT_VERSION, freshDiscoveryGuidance, generateFreshDiscoveryPrompt, generateFreshDiscoveryPromptV2 } from '../lib/freshDiscovery/generateFreshDiscoveryPrompt'
import { ACTIVE_SESSION_STORAGE_KEY, FEEDBACK_STORAGE_KEY, createFeedbackSession, readFeedbackSessions } from '../services/feedbackStorage'
import { contentTypeIds, type SearchQuery } from '../types/reference'

const query: SearchQuery = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }
function seed() { const session = createFeedbackSession('2026-08-08T00:00:00.000Z', 'PIP-TEST-FRESH001'); session.query = query; localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([session])); localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.sessionId) }

describe('Fresh Discovery Prompt v3', () => {
  it('uses v3 with exact, source, link and composition gates for all content types', () => {
    expect(FRESH_DISCOVERY_PROMPT_VERSION).toBe('v3')
    expect(Object.keys(freshDiscoveryGuidance)).toEqual(contentTypeIds)
    for (const contentTypeId of contentTypeIds) {
      const prompt = generateFreshDiscoveryPrompt({ ...query, contentTypeId })
      for (const phrase of ['HARD EXACT-TYPE GATE', 'SOURCE DIVERSITY', 'COMPOSITION DIVERSITY', 'LINK RELIABILITY', 'ABSTRACT FALLBACK PREVENTION', 'без фиксированной квоты']) expect(prompt).toContain(phrase)
      for (const guidance of freshDiscoveryGuidance[contentTypeId]) expect(prompt).toContain(guidance)
      expect(prompt).not.toMatch(/найди\s+(до\s+)?\d+|ровно\s+\d+/i)
    }
  })

  it('preserves the v2 generator for historical sessions and tests', () => {
    expect(generateFreshDiscoveryPromptV2(query)).toContain('A. Exact References')
    expect(generateFreshDiscoveryPromptV2(query)).not.toContain('PIP Fresh Discovery v3')
  })

  it('copies first and records v3 before a provider can open', async () => {
    seed()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryPrompt query={query} onOpenProviderSelector={() => undefined} /><FreshDiscoveryProviderSelector query={query} open onClose={() => undefined} testMode /></FeedbackProvider>)
    expect(screen.queryByRole('button', { name: 'Открыть ChatGPT' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать запрос' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    expect(open).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть ChatGPT' }))
    expect(open).toHaveBeenCalledWith('https://chatgpt.com/', '_blank', 'noopener,noreferrer')
    await waitFor(() => expect(readFeedbackSessions()[0]).toMatchObject({ freshDiscoveryPromptVersion: 'v3', freshDiscoveryPromptShown: true, freshDiscoveryPromptCopied: true, freshDiscoveryProvider: 'chatgpt', freshDiscoveryProviderOpened: true }))
    open.mockRestore()
  })
})
