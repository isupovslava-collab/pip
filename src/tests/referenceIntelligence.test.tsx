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
  it('keeps Anatomy and Data Mapping for the six production Heroes', () => {
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

  it('shows a production source only when both gates pass', () => {
    renderDetail('REF-000013')
    expect(screen.getByText('PIP Approved')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Открыть первоисточник/ })).toHaveAttribute('href', expect.stringContaining('#page='))
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('does not show a production badge for source_found', () => {
    renderDetail('REF-000016')
    expect(screen.queryByText('PIP Approved')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Открыть первоисточник/ })).not.toBeInTheDocument()
  })

  it('does not show a production badge for source_verified but PIP rejected', () => {
    renderDetail('REF-000019')
    expect(screen.queryByText('PIP Approved')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Открыть первоисточник/ })).not.toBeInTheDocument()
  })

  it('does not break a detail page outside the intelligence pilot', () => {
    const reference = references.find(({ id }) => !referenceIntelligence.some((item) => item.referenceId === id))!
    renderDetail(reference.id)
    expect(screen.getByRole('heading', { level: 1, name: reference.title })).toBeInTheDocument()
    expect(screen.queryByText('PIP Approved')).not.toBeInTheDocument()
  })
})
