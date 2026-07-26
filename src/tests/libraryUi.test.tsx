import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import references from '../../public/data/references.json'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { useInspirationBoard } from '../hooks/useInspirationBoard'
import { ReferencePage } from '../pages/ReferencePage'
import { SearchPage } from '../pages/SearchPage'
import type { Reference, SearchQuery } from '../types/reference'

const library = references as Reference[]
const query: SearchQuery = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }

function NewReferenceBoardFixture() {
  const board = useInspirationBoard()
  return <><output aria-label="Новые сохранённые ID">{board.ids.join(',')}</output><button onClick={() => board.add('REF-000100')}>Сохранить новый референс</button></>
}

describe('интерфейс расширенной библиотеки', () => {
  it('динамически показывает размер библиотеки и сохраняет top-6', () => {
    render(<MemoryRouter><InspirationBoardProvider><SearchPage references={library} query={query} setQuery={vi.fn()} /></InspirationBoardProvider></MemoryRouter>)
    expect(screen.getByText(/100 референсами/)).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(6)
  })

  it('открывает подробную страницу референса с ID выше REF-000012', () => {
    const reference = library.find(({ id }) => id === 'REF-000050')
    render(
      <MemoryRouter initialEntries={['/reference/REF-000050']}>
        <InspirationBoardProvider>
          <Routes><Route path="/reference/:id" element={<ReferencePage references={library} query={null} />} /></Routes>
        </InspirationBoardProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1, name: reference?.title })).toBeInTheDocument()
  })

  it('Inspiration Board принимает ID нового референса', async () => {
    const user = userEvent.setup()
    render(<InspirationBoardProvider><NewReferenceBoardFixture /></InspirationBoardProvider>)
    await user.click(screen.getByRole('button', { name: 'Сохранить новый референс' }))
    expect(screen.getByLabelText('Новые сохранённые ID')).toHaveTextContent('REF-000100')
  })
})
