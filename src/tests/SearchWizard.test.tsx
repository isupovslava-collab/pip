import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchWizard } from '../components/SearchWizard'

describe('SearchWizard', () => {
  it('проводит пользователя через пять шагов и запускает рекомендации', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchWizard onSearch={onSearch} />)

    await user.click(screen.getByLabelText(/Защита бюджета/))
    await user.click(screen.getByRole('button', { name: 'Далее' }))
    expect(screen.getByText('Шаг 2 из 5')).toBeInTheDocument()
    await user.click(screen.getByLabelText(/Руководитель компании/))
    await user.click(screen.getByRole('button', { name: 'Далее' }))
    await user.click(screen.getByLabelText(/Получить одобрение/))
    await user.click(screen.getByRole('button', { name: 'Далее' }))
    await user.click(screen.getByLabelText(/Строгий управленческий/))
    await user.click(screen.getByRole('button', { name: 'Далее' }))
    await user.click(screen.getByLabelText(/KPI и ключевые цифры/))
    await user.click(screen.getByRole('button', { name: 'Показать рекомендации' }))

    expect(onSearch).toHaveBeenCalledWith({ scenarioId: 'budget_defense', personaId: 'ceo', goalId: 'approve', styleId: 'executive', contentTypeId: 'kpi' })
  })
})
