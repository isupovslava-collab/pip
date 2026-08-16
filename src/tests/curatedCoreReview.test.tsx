import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { CuratedCoreReviewPage } from '../pages/CuratedCoreReviewPage'
import { CURATED_CORE_REVIEW_STORAGE_KEY } from '../services/curatedCoreReviewStorage'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]

describe('Premium Curated Core Review v3', () => {
  it('shows metadata, preview, status and working quick filters', async () => {
    const user = userEvent.setup()
    render(<CuratedCoreReviewPage references={references} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Premium Curated Core Review v3' })).toBeInTheDocument()
    expect(screen.getByText('REF-000016')).toBeInTheDocument()
    expect(screen.queryByText('REF-000001')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Открыть отдельную gallery' })).toHaveAttribute('href', '#/test-cover-recovery-review')
    expect(screen.getAllByText('Current primary type').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Proposed type').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Type PO verification').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Reclassification Queue' }))
    expect(screen.getByText('REF-000019')).toBeInTheDocument()
    expect(screen.getByText('comparison · Сравнение вариантов')).toBeInTheDocument()
    expect(screen.getByText('story')).toBeInTheDocument()
  })

  it('compares no more than three candidates of one content type', async () => {
    const user = userEvent.setup()
    const comparisonReferences = references.filter(({ primaryContentTypeId }) => primaryContentTypeId === 'comparison').slice(0, 4).map((reference) => ({ ...reference, poReviewDisposition: 'pending' as const, curatedCoreStatus: 'review_only' as const }))
    render(<CuratedCoreReviewPage references={comparisonReferences} />)
    await user.click(screen.getByRole('button', { name: 'All' }))
    await user.selectOptions(screen.getByLabelText('Content type'), 'comparison')
    const compareControls = screen.getAllByRole('checkbox', { name: /Сравнить/ })
    expect(compareControls.length).toBeGreaterThan(3)
    await user.click(compareControls[0])
    await user.click(compareControls[1])
    await user.click(compareControls[2])
    expect(screen.getByRole('heading', { name: 'Candidate Compare Mode' })).toBeInTheDocument()
    expect(screen.getByText(/Выбрано для сравнения:/)).toHaveTextContent('3 / 3')
    expect(screen.getByRole('status')).toHaveTextContent('Можно сравнить максимум 3 варианта')
    expect(compareControls[3]).toBeDisabled()
    expect(screen.getAllByRole('img', { name: /Compare preview/ })).toHaveLength(3)
  })

  it('preserves Product Owner notes locally', async () => {
    const user = userEvent.setup()
    const reference = references.find(({ id }) => id === 'REF-000016')!
    render(<CuratedCoreReviewPage references={[reference]} />)
    const notes = screen.getByLabelText('PO notes REF-000016')
    await user.clear(notes)
    await user.type(notes, 'Нужна проверка типа')
    expect(JSON.parse(localStorage.getItem(CURATED_CORE_REVIEW_STORAGE_KEY) ?? '{}')['REF-000016']).toMatchObject({ contentTypeDecision: 'reclassify', poReviewDisposition: 'reclassify', notes: 'Нужна проверка типа' })
  })

  it('separates Production, Revise and Archive dispositions', async () => {
    const user = userEvent.setup()
    render(<CuratedCoreReviewPage references={references} />)
    await user.click(screen.getByRole('button', { name: 'Production' }))
    expect(screen.getAllByText('Production exposure').length).toBe(17)
    await user.click(screen.getByRole('button', { name: 'Revise' }))
    expect(screen.getByText('REF-000017')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Rejected / Archive' }))
    expect(screen.getByText('REF-000001')).toBeInTheDocument()
    expect(screen.getByText('REF-000031')).toBeInTheDocument()
  })
})
