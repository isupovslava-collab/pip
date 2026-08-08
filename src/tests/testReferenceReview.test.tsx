import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TestReferenceReviewPage } from '../pages/TestReferenceReviewPage'

describe('Source and Product Reference Review UI', () => {
  it('shows separate coverage and filters both review dimensions', async () => {
    const user = userEvent.setup()
    render(<TestReferenceReviewPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Source & Product Reference Review' })).toBeInTheDocument()
    expect(screen.getByText('PIP approved').nextElementSibling).toHaveTextContent('2')
    expect(screen.getAllByText(/Source 1 · PIP [01]/)).toHaveLength(8)
    await user.selectOptions(screen.getByLabelText('Source Status'), 'source_verified')
    expect(screen.getByText(/Показано:/)).toHaveTextContent('8 из 16')
    await user.selectOptions(screen.getByLabelText('Product Status'), 'pip_approved')
    expect(screen.getByText(/Показано:/)).toHaveTextContent('2 из 16')
    expect(screen.getAllByText('Product: pip_approved')).toHaveLength(2)
  })
})
