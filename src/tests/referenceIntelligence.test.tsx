import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { referenceIntelligence } from '../data/sourceReferences/reference-intelligence'
import { sourceReferenceById } from '../data/sourceReferences/source-references'
import { ReferencePage } from '../pages/ReferencePage'
import type { Reference } from '../types/reference'

const references = referencesData as Reference[]

function renderDetail(referenceId: string) {
  return render(
    <MemoryRouter initialEntries={[`/reference/${referenceId}`]}>
      <InspirationBoardProvider>
        <Routes><Route path="/reference/:id" element={<ReferencePage references={references} query={null} />} /></Routes>
      </InspirationBoardProvider>
    </MemoryRouter>,
  )
}

describe('Reference Intelligence Pilot', () => {
  it('содержит Anatomy и Data Mapping ровно для шести production Hero', () => {
    expect(referenceIntelligence.map(({ referenceId }) => referenceId)).toEqual([
      'REF-000013', 'REF-000016', 'REF-000019', 'REF-000025', 'REF-000028', 'REF-000034',
    ])
    referenceIntelligence.forEach((item) => {
      expect(item.whyItWorks).toHaveLength(4)
      expect(item.dataMappingGuide.length).toBeGreaterThanOrEqual(3)
      expect(item.dataMappingGuide.length).toBeLessThanOrEqual(5)
      expect(item.sourceReferenceIds?.every((id) => sourceReferenceById.has(id))).toBe(true)
    })
  })

  it('показывает intelligence и verified source без внешнего thumbnail', () => {
    renderDetail('REF-000013')
    expect(screen.getByRole('heading', { name: 'Почему этот дизайн работает' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Как применить эту композицию к своим данным' })).toBeInTheDocument()
    expect(screen.getByText('Проверенный источник')).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Открыть первоисточник/ })).toHaveAttribute('href', expect.stringContaining('#page='))
  })

  it('не выдаёт badge проверки для source_found', () => {
    renderDetail('REF-000016')
    expect(screen.queryByText('Проверенный источник')).not.toBeInTheDocument()
    expect(screen.getByText(/Источник найден — проверка продолжается/)).toBeInTheDocument()
  })

  it('не ломает detail page у референса вне пилота', () => {
    const reference = references.find(({ id }) => !referenceIntelligence.some((item) => item.referenceId === id))!
    renderDetail(reference.id)
    expect(screen.getByRole('heading', { level: 1, name: reference.title })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Почему этот дизайн работает' })).not.toBeInTheDocument()
  })
})
