import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { FreshDiscoveryPathChoice } from '../components/FreshDiscoveryPrompt'
import { FreshDiscoveryProviderSelector } from '../components/FreshDiscoveryProviderSelector'
import { buildFreshDiscoveryTestSummary } from '../lib/freshDiscovery/buildFreshDiscoveryTestSummary'
import { freshDiscoveryProviders } from '../data/freshDiscoveryProviders'
import { ACTIVE_SESSION_STORAGE_KEY, FEEDBACK_STORAGE_KEY, createFeedbackSession, exportFeedbackCsv, exportFeedbackJson, readFeedbackSessions } from '../services/feedbackStorage'
import type { SearchQuery } from '../types/reference'

const query: SearchQuery = { scenarioId: 'project', personaId: 'board', goalId: 'compare_options', styleId: 'consulting', contentTypeId: 'comparison' }

function seed() {
  const session = createFeedbackSession('2026-08-09T00:00:00.000Z', 'PIP-TEST-HANDOFF')
  session.query = query
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([session]))
  localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.sessionId)
}

describe('Fresh Discovery 2.5 provider handoff', () => {
  it('uses only official provider home URLs without prompt data', () => {
    expect(freshDiscoveryProviders).toEqual([
      { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/', supportsOpen: true },
      { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/', supportsOpen: true },
      { id: 'perplexity', label: 'Perplexity', url: 'https://www.perplexity.ai/', supportsOpen: true },
      { id: 'other', label: 'Другая нейросеть', url: null, supportsOpen: false },
    ])
    for (const provider of freshDiscoveryProviders) if (provider.url) expect(provider.url).not.toMatch(/[?&#](prompt|query|text)=/)
  })

  it('shows all providers in an accessible dialog and closes on Escape', async () => {
    const onClose = vi.fn()
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={onClose} query={query} testMode={false} /></FeedbackProvider>)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'fresh-provider-title')
    for (const label of ['ChatGPT', 'Gemini', 'Perplexity', 'Другая нейросеть']) expect(screen.getByRole('button', { name: `Выбрать ${label}` })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it.each([
    ['ChatGPT', 'https://chatgpt.com/'],
    ['Gemini', 'https://gemini.google.com/'],
    ['Perplexity', 'https://www.perplexity.ai/'],
  ])('opens %s in a safe new tab and copies the unchanged v2 prompt', async (label, url) => {
    seed()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode={false} /></FeedbackProvider>)
    fireEvent.click(screen.getByRole('button', { name: `Выбрать ${label}` }))
    expect(open).toHaveBeenCalledWith(url, '_blank', 'noopener,noreferrer')
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    expect(writeText.mock.calls[0][0]).toContain('A. Exact References')
    expect(writeText.mock.calls[0][0]).not.toContain(url)
    open.mockRestore()
  })

  it('copies for Other AI without opening any URL', async () => {
    seed()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const open = vi.spyOn(window, 'open')
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode={false} /></FeedbackProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать Другая нейросеть' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    expect(open).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Вставьте его в нейросеть с доступом к интернету')
    open.mockRestore()
  })

  it('keeps provider open and exposes prompt retry after clipboard failure', async () => {
    seed()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode={false} /></FeedbackProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать ChatGPT' }))
    await screen.findByRole('button', { name: /Скопировать ещё раз/ })
    expect(open).toHaveBeenCalledOnce()
    expect(screen.getByText(/Сценарий: Защита проекта/)).toBeInTheDocument()
    await waitFor(() => expect(readFeedbackSessions()[0].events.some(({ type }) => type === 'fresh_discovery_prompt_copy_failed')).toBe(true))
    open.mockRestore()
  })

  it('shows a safe explicit link when the popup is blocked', async () => {
    seed()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode={false} /></FeedbackProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать Gemini' }))
    const fallback = await screen.findByRole('link', { name: /Открыть Gemini/ })
    expect(fallback).toHaveAttribute('href', 'https://gemini.google.com/')
    expect(fallback).toHaveAttribute('target', '_blank')
    expect(fallback).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText('Не удалось открыть новую вкладку.')).toBeInTheDocument()
    open.mockRestore()
  })

  it('saves optional post-search feedback and exposes visual quality only in Test Mode', async () => {
    seed()
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryProviderSelector open onClose={() => undefined} query={query} testMode /></FeedbackProvider>)
    await user.click(screen.getByRole('button', { name: 'Выбрать Perplexity' }))
    expect(screen.getByText('Как вы оцениваете визуальное качество найденных референсов?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '3–4' }))
    await user.click(screen.getByRole('button', { name: 'Возможно' }))
    await user.click(screen.getByRole('button', { name: 'Хорошие' }))
    await waitFor(() => expect(readFeedbackSessions()[0]).toMatchObject({ freshDiscoveryUsefulReferenceCount: '3_4', freshDiscoveryWouldUseAgain: 'maybe', freshDiscoveryVisualQuality: 'good' }))
    expect(screen.getByRole('button', { name: /Скопировать краткий отчёт теста/ })).toBeInTheDocument()
    open.mockRestore()
  })

  it('builds a PII-free summary with all five PIP context fields', () => {
    const summary = buildFreshDiscoveryTestSummary(query, 'chatgpt', '3_4', 'good', 'yes')
    for (const field of ['Scenario:', 'Persona:', 'Goal:', 'Style:', 'Content type:']) expect(summary).toContain(field)
    for (const forbidden of ['email', 'phone', 'participant', 'ip address']) expect(summary.toLowerCase()).not.toContain(forbidden)
  })

  it('exports all provider and post-search fields to JSON and CSV', () => {
    const session = createFeedbackSession()
    session.freshDiscoveryProvider = 'chatgpt'
    session.freshDiscoveryProviderOpened = true
    session.freshDiscoveryUsefulReferenceCount = '5_plus'
    session.freshDiscoveryVisualQuality = 'strong'
    session.freshDiscoveryWouldUseAgain = 'yes'
    expect(exportFeedbackJson([session])).toContain('freshDiscoveryProviderOpened')
    const csv = exportFeedbackCsv([session])
    for (const field of ['freshDiscoveryProvider', 'freshDiscoveryProviderOpened', 'freshDiscoveryUsefulReferenceCount', 'freshDiscoveryVisualQuality', 'freshDiscoveryWouldUseAgain']) expect(csv).toContain(field)
    expect(csv).toContain('chatgpt,true,5_plus,strong,yes')
  })
})

describe('Two-path results choice', () => {
  it('keeps PIP Library and Fresh Discovery distinct and functional', async () => {
    const user = userEvent.setup()
    const showPip = vi.fn()
    const showFresh = vi.fn()
    render(<FreshDiscoveryPathChoice onShowPipResults={showPip} onOpenProviderSelector={showFresh} />)
    expect(screen.getByText('Варианты из библиотеки PIP')).toBeInTheDocument()
    expect(screen.getByText('Свежий поиск через AI')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Смотреть варианты PIP' }))
    await user.click(screen.getByRole('button', { name: 'Найти свежие референсы' }))
    expect(showPip).toHaveBeenCalledOnce()
    expect(showFresh).toHaveBeenCalledOnce()
    expect(screen.getByText(/Внешний AI может ошибаться/)).toBeInTheDocument()
    expect(screen.queryByText(/проверенные PIP/i)).not.toBeInTheDocument()
  })
})
