import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestFeedbackPage } from '../pages/TestFeedbackPage'

describe('служебный экран feedback', () => {
  afterEach(() => vi.restoreAllMocks())

  it('подключает локальные JSON и CSV downloads', () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    fireEvent.click(render(<TestFeedbackPage />).getByRole('button', { name: 'Скачать JSON' }))
    fireEvent.click(screen.getByRole('button', { name: 'Скачать CSV' }))

    expect(createObjectUrl).toHaveBeenCalledTimes(2)
    expect(anchorClick).toHaveBeenCalledTimes(2)
  })

  it('показывает метрику отсутствия подходящего результата', () => {
    render(<TestFeedbackPage />)
    expect(screen.getByText('Нет подходящего')).toBeInTheDocument()
    expect(screen.getByText('0 · 0%')).toBeInTheDocument()
  })

  it('запрашивает подтверждение перед reset', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<TestFeedbackPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Удалить данные тестирования' }))
    expect(confirm).toHaveBeenCalledWith('Удалить все локальные результаты тестирования?')
  })
})
