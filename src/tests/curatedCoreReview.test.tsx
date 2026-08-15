import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { CuratedCoreReviewPage } from '../pages/CuratedCoreReviewPage'
import { CURATED_CORE_REVIEW_STORAGE_KEY } from '../services/curatedCoreReviewStorage'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]

describe('Premium Curated Core Review v2', () => {
  it('shows metadata, preview, status and working quick filters', async () => {
    const user = userEvent.setup()
    render(<CuratedCoreReviewPage references={references} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Premium Curated Core Review v2' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Preview Коммерческое предложение/ })).toBeInTheDocument()
    expect(screen.getAllByText('Current primary type').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Proposed type').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Type PO verification').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Reclassify' }))
    expect(screen.getByText('REF-000019')).toBeInTheDocument()
    expect(screen.getByText('comparison · Сравнение вариантов')).toBeInTheDocument()
    expect(screen.getByText('story')).toBeInTheDocument()
  })

  it('compares no more than three candidates of one content type', async () => {
    const user = userEvent.setup()
    const comparisonReferences = references.filter(({ primaryContentTypeId }) => primaryContentTypeId === 'comparison').slice(0, 4)
    render(<CuratedCoreReviewPage references={comparisonReferences} />)
    await user.selectOptions(screen.getByLabelText('Content type'), 'comparison')
    const compareControls = screen.getAllByRole('checkbox', { name: /Сравнить/ })
    expect(compareControls.length).toBeGreaterThan(3)
    await user.click(compareControls[0])
    await user.click(compareControls[1])
    await user.click(compareControls[2])
    expect(screen.getByRole('heading', { name: 'Candidate Compare Mode' })).toBeInTheDocument()
    expect(screen.getByText(/Выбрано для сравнения:/)).toHaveTextContent('3 / 3')
    expect(compareControls[3]).toBeDisabled()
    expect(screen.getAllByRole('img', { name: /Compare preview/ })).toHaveLength(3)
  })

  it('preserves Product Owner notes locally', async () => {
    const user = userEvent.setup()
    render(<CuratedCoreReviewPage references={references.slice(0, 1)} />)
    const notes = screen.getByLabelText('PO notes REF-000001')
    await user.type(notes, 'Нужна проверка типа')
    expect(JSON.parse(localStorage.getItem(CURATED_CORE_REVIEW_STORAGE_KEY) ?? '{}')['REF-000001']).toMatchObject({ contentTypeDecision: 'pending', notes: 'Нужна проверка типа' })
  })
})
