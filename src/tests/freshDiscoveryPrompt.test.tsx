import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { FreshDiscoveryPrompt } from '../components/FreshDiscoveryPrompt'
import { FreshDiscoveryProviderSelector } from '../components/FreshDiscoveryProviderSelector'
import { FRESH_DISCOVERY_PROMPT_VERSION, freshDiscoveryGuidance, generateFreshDiscoveryPrompt } from '../lib/freshDiscovery/generateFreshDiscoveryPrompt'
import { ACTIVE_SESSION_STORAGE_KEY, FEEDBACK_STORAGE_KEY, createFeedbackSession, readFeedbackSessions } from '../services/feedbackStorage'
import { contentTypeIds, type SearchQuery } from '../types/reference'

const query: SearchQuery = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }

function seedActiveSession() {
  const session = createFeedbackSession('2026-08-08T00:00:00.000Z', 'PIP-TEST-FRESH001')
  session.query = query
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([session]))
  localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, session.sessionId)
}

describe('Fresh Discovery Prompt v2', () => {
  it('uses v2 and distinct content guidance for all eight content types', () => {
    expect(FRESH_DISCOVERY_PROMPT_VERSION).toBe('v2')
    expect(Object.keys(freshDiscoveryGuidance)).toEqual(contentTypeIds)
    for (const contentTypeId of contentTypeIds) {
      const prompt = generateFreshDiscoveryPrompt({ ...query, contentTypeId })
      for (const label of ['Сценарий:', 'Аудитория:', 'Цель:', 'Стиль:', 'Тип слайда:']) expect(prompt).toContain(label)
      for (const guidance of freshDiscoveryGuidance[contentTypeId]) expect(prompt).toContain(guidance)
      expect(prompt).not.toMatch(/undefined|null/)
    }
  })

  it('optimizes for verified visual quality instead of filling a quota', () => {
    const prompt = generateFreshDiscoveryPrompt(query)
    expect(prompt).toContain('до 8')
    expect(prompt).toContain('Если удалось подтвердить только 4–6 сильных вариантов — покажи только их')
    expect(prompt).toContain('Не добавляй слабые примеры ради количества')
    expect(prompt).not.toMatch(/6[–-]10|найди\s+8\s/i)
    expect(prompt).toContain('визуально проверь сам конкретный слайд')
    expect(prompt).toContain('Screen Suitability')
    expect(prompt).toContain('Design Freshness')
    expect(prompt).toContain('журнальный разворот или буклет')
    expect(prompt).toContain('слишком простые схемы и wireframes')
    expect(prompt).toContain('покажи preview найденного слайда')
  })

  it('orders Exact References before useful Creative Alternatives and forbids invented facts', () => {
    const prompt = generateFreshDiscoveryPrompt(query)
    expect(prompt.indexOf('A. Exact References')).toBeLessThan(prompt.indexOf('B. Creative Alternatives'))
    expect(prompt).toContain('Сначала показывай Exact References')
    expect(prompt).toContain('не придумывай URL')
    expect(prompt).toContain('не придумывай номер страницы')
    expect(prompt).toContain('не придумывай название или содержание слайда')
  })

  it('copies Prompt v2 through provider handoff and records the context once', async () => {
    seedActiveSession()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const open = vi.spyOn(window, 'open').mockReturnValue({} as Window)
    render(<FeedbackProvider><FreshDiscoveryPrompt query={query} onOpenProviderSelector={() => undefined} /><FreshDiscoveryProviderSelector query={query} open onClose={() => undefined} testMode /></FeedbackProvider>)

    expect(screen.getByRole('heading', { name: 'Где искать свежие референсы?' })).toBeInTheDocument()
    expect(screen.getByText(/не являются проверенными PIP-референсами/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Посмотреть промпт' }))
    expect(screen.getByText(/Сценарий: Продажа/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать ChatGPT' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce())
    expect(writeText.mock.calls[0][0]).toContain('A. Exact References')
    expect(open).toHaveBeenCalledWith('https://chatgpt.com/', '_blank', 'noopener,noreferrer')
    expect(screen.getByRole('status')).toHaveTextContent('Промпт скопирован')

    await waitFor(() => {
      const session = readFeedbackSessions()[0]
      expect(session.freshDiscoveryPromptVersion).toBe('v2')
      expect(session.freshDiscoveryPromptShown).toBe(true)
      expect(session.freshDiscoveryPromptCopied).toBe(true)
      expect(session.freshDiscoveryProvider).toBe('chatgpt')
      expect(session.freshDiscoveryProviderOpened).toBe(true)
      expect(session.events.filter(({ type }) => type === 'fresh_discovery_prompt_shown')).toHaveLength(1)
      expect(session.events.filter(({ type }) => type === 'fresh_discovery_prompt_copied')).toHaveLength(1)
      expect(session.events.find(({ type }) => type === 'fresh_discovery_prompt_copied')).toMatchObject({ ...query, freshDiscoveryPromptVersion: 'v2' })
    })
  })
})
