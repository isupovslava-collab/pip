import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import { FeedbackProvider } from '../components/FeedbackProvider'
import { CollectionFeedback } from '../components/CollectionFeedback'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { TestModeBanner } from '../components/TestModeBanner'
import { useFeedback } from '../hooks/useFeedback'
import { useInspirationBoard } from '../hooks/useInspirationBoard'
import { rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'
import { isTestMode } from '../utils/testMode'

const query: SearchQuery = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }
const results = rankReferences(referencesData as Reference[], query).slice(0, 6)

function FeedbackFixture() {
  const feedback = useFeedback()
  const board = useInspirationBoard()
  return <>
    <output aria-label="session">{feedback.activeSession?.sessionId ?? ''}</output>
    <output aria-label="rating">{feedback.activeSession?.collectionRating ?? ''}</output>
    <output aria-label="reference-feedback">{feedback.activeSession?.referenceFeedback.length ?? 0}</output>
    <output aria-label="best">{feedback.activeSession?.bestReferenceId ?? ''}</output>
    <output aria-label="events">{feedback.activeSession?.events.map(({ type }) => type).join(',') ?? ''}</output>
    <output aria-label="board">{board.ids.join(',')}</output>
    <button onClick={feedback.startSession}>start</button>
    <button onClick={() => feedback.completeWizard(query, results)}>complete</button>
    <button onClick={() => feedback.submitCollectionFeedback('partially_useful', ['Не подходит визуальный стиль'], 'Комментарий', 'probably_yes')}>collection</button>
    <button onClick={() => feedback.submitReferenceFeedback({ referenceId: 'REF-000013', useful: false, issues: ['Слишком простой'], comment: '' })}>reference</button>
    <button onClick={() => feedback.selectBestReference('REF-000013')}>best-13</button>
    <button onClick={() => feedback.selectBestReference('REF-000014')}>best-14</button>
    <button onClick={() => { board.add('REF-000015'); feedback.recordBoardAction('REF-000015', true) }}>board-add</button>
    <CollectionFeedback testMode />
  </>
}

function renderFeedback() {
  return render(<FeedbackProvider><InspirationBoardProvider><FeedbackFixture /></InspirationBoardProvider></FeedbackProvider>)
}

async function startCompletedSession(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'start' }))
  await user.click(screen.getByRole('button', { name: 'complete' }))
}

describe('feedback session flow', () => {
  it('сохраняет collection и reference feedback и события', async () => {
    const user = userEvent.setup(); renderFeedback(); await startCompletedSession(user)
    await user.click(screen.getByRole('button', { name: 'collection' }))
    await user.click(screen.getByRole('button', { name: 'reference' }))
    expect(screen.getByLabelText('rating')).toHaveTextContent('partially_useful')
    expect(screen.getByLabelText('reference-feedback')).toHaveTextContent('1')
    expect(screen.getByLabelText('events')).toHaveTextContent('collection_feedback_submitted')
    expect(screen.getByLabelText('events')).toHaveTextContent('reference_feedback_submitted')
  })

  it('хранит только один Best Reference', async () => {
    const user = userEvent.setup(); renderFeedback(); await startCompletedSession(user)
    await user.click(screen.getByRole('button', { name: 'best-13' }))
    await user.click(screen.getByRole('button', { name: 'best-14' }))
    expect(screen.getByLabelText('best')).toHaveTextContent('REF-000014')
    expect(screen.getByLabelText('best')).not.toHaveTextContent('REF-000013')
  })

  it('разделяет Best Reference и Inspiration Board', async () => {
    const user = userEvent.setup(); renderFeedback(); await startCompletedSession(user)
    await user.click(screen.getByRole('button', { name: 'best-13' }))
    await user.click(screen.getByRole('button', { name: 'board-add' }))
    expect(screen.getByLabelText('best')).toHaveTextContent('REF-000013')
    expect(screen.getByLabelText('board')).toHaveTextContent('REF-000015')
  })

  it('восстанавливает активную сессию после remount', async () => {
    const user = userEvent.setup(); const view = renderFeedback(); await startCompletedSession(user)
    const sessionId = screen.getByLabelText('session').textContent
    view.unmount(); renderFeedback()
    expect(screen.getByLabelText('session')).toHaveTextContent(sessionId ?? '')
  })

  it('принимает длинный комментарий и показывает лимит 4000 символов', async () => {
    const user = userEvent.setup(); renderFeedback(); await startCompletedSession(user)
    await user.click(screen.getByRole('button', { name: /Полезная/ }))
    const textarea = screen.getByRole('textbox', { name: /Комментарий/ })
    expect(textarea).toHaveAttribute('maxlength', '4000')
    const longComment = 'Подробная обратная связь. '.repeat(60)
    expect(longComment.length).toBeGreaterThan(1000)
    fireEvent.change(textarea, { target: { value: longComment } })
    expect(textarea).toHaveValue(longComment)
    expect(screen.getByText(`${longComment.length} / 4000`)).toBeInTheDocument()
  })
})

function TestModeFixture() {
  const { search } = useLocation()
  return isTestMode(search) ? <TestModeBanner /> : <p>Обычный режим</p>
}

describe('Test Mode', () => {
  it('показывает test UI только при test=1', () => {
    render(<MemoryRouter initialEntries={['/search?test=1']}><TestModeFixture /></MemoryRouter>)
    expect(screen.getByText(/Тестовая версия PIP/)).toBeInTheDocument()
  })

  it('не показывает test UI в normal mode', () => {
    render(<MemoryRouter initialEntries={['/search']}><TestModeFixture /></MemoryRouter>)
    expect(screen.queryByText(/Тестовая версия PIP/)).not.toBeInTheDocument()
    expect(screen.getByText('Обычный режим')).toBeInTheDocument()
  })
})
