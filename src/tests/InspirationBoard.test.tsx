import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { useInspirationBoard } from '../hooks/useInspirationBoard'
import { BOARD_STORAGE_KEY, readBoardIds } from '../utils/storage'

function BoardFixture() {
  const board = useInspirationBoard()
  return <div><output aria-label="Сохраненные ID">{board.ids.join(',')}</output><button onClick={() => board.add('REF-000001')}>Добавить</button><button onClick={() => board.remove('REF-000001')}>Удалить</button></div>
}

describe('Inspiration Board', () => {
  it('добавляет ID, не создает дубликаты и удаляет его', async () => {
    const user = userEvent.setup()
    render(<InspirationBoardProvider><BoardFixture /></InspirationBoardProvider>)
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    expect(screen.getByLabelText('Сохраненные ID')).toHaveTextContent('REF-000001')
    expect(JSON.parse(localStorage.getItem(BOARD_STORAGE_KEY) ?? '[]')).toEqual(['REF-000001'])
    await user.click(screen.getByRole('button', { name: 'Удалить' }))
    expect(screen.getByLabelText('Сохраненные ID')).toBeEmptyDOMElement()
  })

  it('восстанавливает сохраненные ID', () => {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(['REF-000002']))
    render(<InspirationBoardProvider><BoardFixture /></InspirationBoardProvider>)
    expect(screen.getByLabelText('Сохраненные ID')).toHaveTextContent('REF-000002')
  })

  it('очищает поврежденные данные', () => {
    localStorage.setItem(BOARD_STORAGE_KEY, '{сломано')
    expect(readBoardIds()).toEqual([])
    expect(localStorage.getItem(BOARD_STORAGE_KEY)).toBeNull()
  })
})
