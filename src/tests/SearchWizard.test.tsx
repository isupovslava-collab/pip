import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchWizard } from '../components/SearchWizard'

describe('SearchWizard', () => {
  it('показывает обновленные сценарии в заданном порядке', () => {
    render(<SearchWizard onSearch={vi.fn()} />)
    const values = screen.getAllByRole('radio').map((radio) => (radio as HTMLInputElement).value)

    expect(values).toEqual(['sales', 'speech', 'project', 'meeting', 'report', 'training', 'strategy', 'budget_defense'])
    expect(screen.getByText('Продать продукт, услугу или решение клиенту')).toBeInTheDocument()
    expect(screen.getByText('Представить проект и убедить поддержать идею')).toBeInTheDocument()
    expect(screen.queryByText('Продажа идеи')).not.toBeInTheDocument()
  })

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
