import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { FreshDiscoveryPrompt } from '../components/FreshDiscoveryPrompt'
import { freshDiscoveryGuidance, generateFreshDiscoveryPrompt } from '../lib/freshDiscovery/generateFreshDiscoveryPrompt'
import { ACTIVE_SESSION_STORAGE_KEY, FEEDBACK_STORAGE_KEY, createFeedbackSession, readFeedbackSessions } from '../services/feedbackStorage'
import { contentTypeIds, type SearchQuery } from '../types/reference'

const query: SearchQuery = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }

function seedActiveSession() {
  const session = createFeedbackSession('2026-08-08T00:00:00.000Z', 'PIP-TEST-FRESH001')
  session.query = query
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([session]))
  localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.sessionId)
}

describe('Fresh Discovery Prompt pilot', () => {
  it('generates readable query context and specific guidance for all content types', () => {
    for (const contentTypeId of contentTypeIds) {
      const prompt = generateFreshDiscoveryPrompt({ ...query, contentTypeId })
      for (const label of ['Сценарий:', 'Аудитория:', 'Цель:', 'Стиль:', 'Тип слайда:']) expect(prompt).toContain(label)
      for (const guidance of freshDiscoveryGuidance[contentTypeId]) expect(prompt).toContain(guidance)
      expect(prompt).toContain('не придумывай URL')
      expect(prompt).not.toMatch(/undefined|null/)
    }
  })

  it('previews, copies, disclaims external results, and records each event once', async () => {
    seedActiveSession()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const view = render(<FeedbackProvider><FreshDiscoveryPrompt query={query} testMode /></FeedbackProvider>)

    expect(screen.getByRole('heading', { name: 'Найти ещё свежие референсы' })).toBeInTheDocument()
    expect(screen.getByText(/не являются проверенными PIP-референсами/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Посмотреть промпт' }))
    expect(screen.getByText(/Сценарий: Продажа/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать промпт для AI-поиска' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    expect(screen.getByRole('status')).toHaveTextContent('Промпт скопирован')
    fireEvent.click(screen.getByRole('button', { name: 'Да' }))
    view.rerender(<FeedbackProvider><FreshDiscoveryPrompt query={query} testMode /></FeedbackProvider>)

    await waitFor(() => {
      const session = readFeedbackSessions()[0]
      expect(session.freshDiscoveryPromptShown).toBe(true)
      expect(session.freshDiscoveryPromptCopied).toBe(true)
      expect(session.freshDiscoveryHelpful).toBe('yes')
      expect(session.events.filter(({ type }) => type === 'fresh_discovery_prompt_shown')).toHaveLength(1)
      expect(session.events.filter(({ type }) => type === 'fresh_discovery_prompt_copied')).toHaveLength(1)
      expect(session.events.find(({ type }) => type === 'fresh_discovery_prompt_copied')).toMatchObject(query)
    })
  })
})
