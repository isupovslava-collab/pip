import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { presentationIntelligenceById, presentationIntelligenceV1 } from '../data/referenceIntelligence'
import { PresentationIntelligenceReviewPage } from '../pages/PresentationIntelligenceReviewPage'
import { ReferencePage } from '../pages/ReferencePage'
import { composeDesignBrief } from '../services/composeDesignBrief'
import { isCuratedCoreEligible } from '../services/selectCuratedCore'
import { createPresentationIntelligenceReviewExport, PRESENTATION_INTELLIGENCE_REVIEW_STORAGE_KEY } from '../services/presentationIntelligenceReviewStorage'
import type { ContentTypeId, Reference, SearchQuery } from '../types/reference'

const references = referencesData as Reference[]
const production = references.filter(isCuratedCoreEligible)
const query: SearchQuery = { scenarioId: 'report', personaId: 'board', goalId: 'explain_results', styleId: 'executive', contentTypeId: 'kpi' }

function renderDetail(referenceId: string, activeQuery: SearchQuery | null = query) {
  return render(<MemoryRouter initialEntries={[`/reference/${referenceId}`]}><InspirationBoardProvider><Routes><Route path="/reference/:id" element={<ReferencePage references={references} query={activeQuery} />} /></Routes></InspirationBoardProvider></MemoryRouter>)
}

describe('Presentation Intelligence V1 data', () => {
  it('covers exactly all 20 production-approved references and no archive records', () => {
    expect(production).toHaveLength(20)
    expect(presentationIntelligenceV1).toHaveLength(20)
    expect(new Set(presentationIntelligenceV1.map(({ referenceId }) => referenceId))).toEqual(new Set(production.map(({ id }) => id)))
  })

  it('matches the required content-type coverage', () => {
    const count = (contentTypeId: ContentTypeId) => presentationIntelligenceV1.filter((item) => item.contentTypeId === contentTypeId).length
    expect({ kpi: count('kpi'), comparison: count('comparison'), timeline: count('timeline'), process: count('process'), dashboard: count('dashboard'), cover: count('cover'), story: count('story'), table: count('table') }).toEqual({ kpi: 3, comparison: 2, timeline: 2, process: 3, dashboard: 2, cover: 3, story: 2, table: 3 })
  })

  it('contains complete schema-v1 records without duplicate visual principles', () => {
    expect(new Set(presentationIntelligenceV1.map(({ visualPrinciple }) => visualPrinciple)).size).toBe(20)
    presentationIntelligenceV1.forEach((item) => {
      expect(item.schemaVersion).toBe(1)
      expect(item.visualPrinciple.length).toBeGreaterThan(40)
      expect(item.whyItWorks.length).toBeGreaterThanOrEqual(3)
      expect(item.whyItWorks.length).toBeLessThanOrEqual(5)
      expect(item.anatomy.length).toBeGreaterThanOrEqual(3)
      expect(item.hierarchy.primary).toBeTruthy()
      expect(item.hierarchy.secondary).toBeTruthy()
      expect(item.hierarchy.supporting.length).toBeGreaterThan(0)
      expect(item.contentMapping.length).toBeGreaterThanOrEqual(2)
      expect(item.adaptation.preserve.length).toBeGreaterThanOrEqual(2)
      expect(item.adaptation.replace.length).toBeGreaterThanOrEqual(2)
      expect(item.adaptation.avoid.length).toBeGreaterThanOrEqual(2)
      expect(item.bestFor.length).toBeGreaterThanOrEqual(2)
      expect(item.designBrief.constraints.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('gives the three Cover references three different visual mechanisms', () => {
    expect(presentationIntelligenceById.get('REF-000016')?.visualPrinciple).toContain('образ моста')
    expect(presentationIntelligenceById.get('REF-000017')?.visualPrinciple).toContain('луч света')
    expect(presentationIntelligenceById.get('REF-000047')?.visualPrinciple).toContain('whitespace')
    expect(presentationIntelligenceById.has('COVER-R2-03B')).toBe(false)
  })
})

describe('Presentation Intelligence V1 detail UX', () => {
  it('renders every Intelligence component for a production reference', () => {
    renderDetail('REF-000025')
    expect(screen.getByRole('heading', { name: 'Почему этот слайд работает' })).toBeInTheDocument()
    expect(screen.getByText('Визуальный принцип')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Почему это работает' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Анатомия слайда' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Что заметит зритель' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Что заменить своими данными' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Что сохранить' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Чего избегать' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Где этот подход особенно полезен' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Дизайн-бриф' })).toBeInTheDocument()
  })

  it('copies a context-aware design brief and announces confirmation', async () => {
    const user = userEvent.setup()
    renderDetail('REF-000025')
    await user.click(screen.getByRole('button', { name: 'Скопировать дизайн-бриф' }))
    const brief = await navigator.clipboard.readText()
    expect(brief).toContain('Сценарий: Отчёт')
    expect(brief).toContain('Аудитория: Правление')
    expect(brief).toContain('Цель: Объяснить результаты')
    expect(brief).toContain('Стиль: Строгий управленческий')
    expect(brief).toContain('Тип слайда: KPI и ключевые цифры')
    expect(brief).toContain(presentationIntelligenceById.get('REF-000025')!.visualPrinciple)
    expect(brief).toContain('СОХРАНИТЬ')
    expect(brief).toContain('ЗАМЕНИТЬ СВОИМИ ДАННЫМИ')
    expect(brief).toContain('ИЗБЕГАТЬ')
    expect(brief).toContain('Не копируйте конкретные данные, текст, брендинг, логотипы')
    expect(brief).not.toContain('₽462 млн')
    expect(screen.getByRole('status')).toHaveTextContent('✓ Дизайн-бриф скопирован')
  })

  it('composes a useful brief without wizard history', () => {
    const reference = production.find(({ id }) => id === 'REF-000047')!
    const brief = composeDesignBrief(reference, presentationIntelligenceById.get(reference.id)!, null)
    expect(brief).toContain('Контекст мастера не задан')
    expect(brief).toContain('Тип слайда: Титульный слайд')
    expect(brief).toContain('Без декоративной графики')
  })

  it('does not expose Intelligence on a rejected archive detail', () => {
    const archived = references.find((reference) => !isCuratedCoreEligible(reference) && !presentationIntelligenceById.has(reference.id))!
    renderDetail(archived.id, null)
    expect(screen.queryByRole('heading', { name: 'Почему этот слайд работает' })).not.toBeInTheDocument()
  })
})

describe('Internal Presentation Intelligence PO review', () => {
  it('shows 20 references, filters by content type and navigates', async () => {
    const user = userEvent.setup()
    render(<PresentationIntelligenceReviewPage references={references} />)
    expect(screen.getByText(/20 production references доступны для проверки Intelligence/)).toBeInTheDocument()
    expect(screen.getByText(/Показано:/)).toHaveTextContent('20')
    expect(screen.getByRole('img', { name: /REF-000013/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next →' }))
    expect(screen.getByRole('img', { name: /REF-000014/ })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Content Type'), 'cover')
    expect(screen.getByText(/Показано:/)).toHaveTextContent('3')
    expect(screen.getByRole('img', { name: /REF-000016/ })).toBeInTheDocument()
  })

  it('stores local Intelligence status and notes without changing production approval', async () => {
    const user = userEvent.setup()
    const before = production.find(({ id }) => id === 'REF-000013')!.productionApproved
    render(<PresentationIntelligenceReviewPage references={references} />)
    await user.selectOptions(screen.getByLabelText('Intelligence PO status REF-000013'), 'revise')
    await user.type(screen.getByLabelText('Intelligence PO notes REF-000013'), 'Уточнить wording второго insight')
    expect(JSON.parse(localStorage.getItem(PRESENTATION_INTELLIGENCE_REVIEW_STORAGE_KEY) ?? '{}')['REF-000013']).toMatchObject({ intelligenceStatus: 'revise', poNotes: 'Уточнить wording второго insight' })
    expect(production.find(({ id }) => id === 'REF-000013')!.productionApproved).toBe(before)
  })

  it('exports all 20 local-only review records', () => {
    const exported = createPresentationIntelligenceReviewExport(presentationIntelligenceV1, {}, '2026-08-22T00:00:00.000Z')
    expect(exported).toMatchObject({ schemaVersion: 1, exportedAt: '2026-08-22T00:00:00.000Z', productionApprovalAffected: false })
    expect(exported.reviews).toHaveLength(20)
  })
})
