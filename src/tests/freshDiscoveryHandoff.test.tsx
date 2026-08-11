import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { FreshDiscoveryProviderSelector } from '../components/FreshDiscoveryProviderSelector'
import { freshDiscoveryProviders } from '../data/freshDiscoveryProviders'
import { ACTIVE_SESSION_STORAGE_KEY, FEEDBACK_STORAGE_KEY, createFeedbackSession, exportFeedbackCsv, readFeedbackSessions } from '../services/feedbackStorage'
import type { SearchQuery } from '../types/reference'

const query: SearchQuery = { scenarioId: 'project', personaId: 'board', goalId: 'compare_options', styleId: 'consulting', contentTypeId: 'comparison' }
function seed() { const session = createFeedbackSession('2026-08-09T00:00:00.000Z', 'PIP-TEST-HANDOFF'); session.query = query; localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([session])); localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.sessionId) }

describe('Fresh Discovery v3 two-step handoff', () => {
  it('keeps official provider URLs free of prompt data', () => { for (const provider of freshDiscoveryProviders) if (provider.url) expect(provider.url).not.toMatch(/[?&#](prompt|query|text)=/) })

  it('never opens a provider when clipboard copy fails and offers retry/selection', async () => {
    seed(); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } }); const open = vi.spyOn(window, 'open')
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode={false} /></FeedbackProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать запрос' }))
    await screen.findByRole('alert')
    expect(open).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Повторить' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Выделить запрос' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Открыть ChatGPT' })).not.toBeInTheDocument()
    open.mockRestore()
  })

  it('opens only on a separate provider click after copy success', async () => {
    seed(); const writeText = vi.fn().mockResolvedValue(undefined); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } }); const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode={false} /></FeedbackProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать запрос' }))
    await screen.findByRole('button', { name: 'Открыть Gemini' })
    expect(open).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Открыть Gemini' }))
    expect(open).toHaveBeenCalledOnce()
    open.mockRestore()
  })

  it('stores schema v6 link quality and test-only diversity', async () => {
    seed(); const user = userEvent.setup(); Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } }); vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode /></FeedbackProvider>)
    await user.click(screen.getByRole('button', { name: 'Скопировать запрос' })); await user.click(await screen.findByRole('button', { name: 'Открыть Perplexity' })); await user.click(screen.getByRole('button', { name: '3–4' })); await user.click(screen.getByRole('button', { name: 'Большинство' })); await user.click(screen.getByRole('button', { name: 'Возможно' })); await user.click(screen.getByRole('button', { name: 'Хорошие' })); await user.click(screen.getByRole('button', { name: 'Разнообразны' }))
    await waitFor(() => expect(readFeedbackSessions()[0]).toMatchObject({ feedbackSchemaVersion: 6, freshDiscoveryUsefulReferenceCount: '3_4', freshDiscoveryLinkQuality: 'most', freshDiscoveryDiversity: 'diverse' }))
  })

  it('exports new fields to CSV', () => { const session = createFeedbackSession(); session.freshDiscoveryLinkQuality = 'all'; session.freshDiscoveryDiversity = 'diverse'; const csv = exportFeedbackCsv([session]); expect(csv).toContain('freshDiscoveryLinkQuality'); expect(csv).toContain('freshDiscoveryDiversity') })
})
