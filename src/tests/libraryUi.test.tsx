import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import references from '../../public/data/references.json'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { ReferenceCard } from '../components/ReferenceCard'
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
  it('показывает точный Premium Curated Core без legacy top-6', () => {
    render(<MemoryRouter><InspirationBoardProvider><SearchPage references={library} query={query} setQuery={vi.fn()} /></InspirationBoardProvider></MemoryRouter>)
    expect(screen.getByText(/Мы показываем только те PIP-референсы, которые точно соответствуют/)).toBeInTheDocument()
    expect(screen.getByText('Тип слайда: Сравнение вариантов')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getAllByText('Эталон PIP')).toHaveLength(2)
    expect(screen.queryByText('Business case проекта Phoenix')).not.toBeInTheDocument()
    expect(screen.queryByText(/% соответствия/)).not.toBeInTheDocument()
  })

  it('показывает утверждённое Cover-покрытие и низкое Timeline-покрытие без fillers', () => {
    const view = render(<MemoryRouter><InspirationBoardProvider><SearchPage references={library} query={{ ...query, contentTypeId: 'cover' }} setQuery={vi.fn()} /></InspirationBoardProvider></MemoryRouter>)
    expect(screen.getByText('Будущее не случается. Мы переходим в него.')).toBeInTheDocument()
    expect(screen.getByText('Следующий рубеж ближе, чем кажется.')).toBeInTheDocument()
    expect(screen.getByText('Стратегия без лишнего.')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    view.rerender(<MemoryRouter><InspirationBoardProvider><SearchPage references={library} query={{ ...query, contentTypeId: 'timeline' }} setQuery={vi.fn()} /></InspirationBoardProvider></MemoryRouter>)
    expect(screen.getByText('Сейчас в PIP есть два эталонных варианта. Для дополнительных свежих примеров используйте Fresh Discovery.')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
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
    expect(screen.getByRole('img', { name: `Превью слайда: ${reference?.title}` })).toHaveClass('aspect-video', 'max-w-full', 'object-contain')
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('break-words')
  })

  it('Inspiration Board принимает ID нового референса', async () => {
    const user = userEvent.setup()
    render(<InspirationBoardProvider><NewReferenceBoardFixture /></InspirationBoardProvider>)
    await user.click(screen.getByRole('button', { name: 'Сохранить новый референс' }))
    expect(screen.getByLabelText('Новые сохранённые ID')).toHaveTextContent('REF-000100')
  })

  it('показывает fallback badge только для неточного content match', () => {
    const compatible = { ...library[0], score: 80, reasons: ['Подходит по задаче'], contentMatch: 'compatible' as const }
    const view = render(<MemoryRouter><InspirationBoardProvider><ReferenceCard reference={compatible} /></InspirationBoardProvider></MemoryRouter>)
    expect(screen.getByText('Близкий формат')).toBeInTheDocument()
    expect(screen.getByText(/Добавлен как близкий вариант, потому что точных референсов недостаточно/)).toHaveClass('sr-only')
    view.rerender(<MemoryRouter><InspirationBoardProvider><ReferenceCard reference={{ ...compatible, contentMatch: 'exact' }} /></InspirationBoardProvider></MemoryRouter>)
    expect(screen.queryByText('Близкий формат')).not.toBeInTheDocument()
  })
})
