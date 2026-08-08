import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TestReferenceReviewPage } from '../pages/TestReferenceReviewPage'

describe('Verified Reference Review UI', () => {
  it('показывает coverage и фильтрует verified records', async () => {
    const user = userEvent.setup()
    render(<TestReferenceReviewPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Verified Reference Review' })).toBeInTheDocument()
    expect(screen.getAllByText('1 / 3')).toHaveLength(8)
    await user.selectOptions(screen.getByLabelText('Status'), 'verified')
    expect(screen.getByText(/Показано:/)).toHaveTextContent('8 из 16')
    expect(screen.getAllByText('verified').length).toBeGreaterThanOrEqual(8)
  })
})
