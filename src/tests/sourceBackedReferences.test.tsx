import fs from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import { InspirationBoardProvider } from '../components/InspirationBoardProvider'
import { controlQueries } from '../data/controlQueries'
import { goldReferences } from '../data/goldReferences'
import { ReferencePage } from '../pages/ReferencePage'
import { rankReferences } from '../services/rankReferences'
import type { Reference } from '../types/reference'

const references = referencesData as Reference[]
const sourceBacked = references.filter((reference) => reference.sourceBacked)

describe('Source-backed Gold References', () => {
  it('содержит 24 полные и юридически безопасные source records', () => {
    expect(sourceBacked).toHaveLength(24)
    sourceBacked.forEach((reference) => {
      expect(reference.qualityTier).toBe('gold')
      expect(reference.previewMode).toBe('original_pip_interpretation')
      expect(reference.sourceUrl).toMatch(/^https:\/\//)
      expect(reference.sourceTitle?.length).toBeGreaterThan(4)
      expect(reference.sourceOrganization?.length).toBeGreaterThan(2)
      expect(reference.sourceNotes?.length).toBeGreaterThan(80)
      expect(reference.rightsStatus).toMatch(/^(public-link-reference-only|licensed-for-reuse|public-domain|cc-licensed|unknown-link-only)$/)
      expect(reference.sourceAccessCheckedAt).toBe('2026-07-26')
    })
  })

  it('связывает все 24 control queries с назначенными source-backed Gold References', () => {
    goldReferences.forEach((mapping) => {
      const query = controlQueries.find(({ id }) => id === mapping.queryId)
      const reference = references.find(({ id }) => id === mapping.referenceId)
      expect(mapping).toMatchObject({ sourceBacked: true, qualityTier: 'gold', previewMode: 'original_pip_interpretation' })
      expect(mapping.sourceUrl).toBe(reference?.sourceUrl)
      expect(reference?.sourceBacked).toBe(true)
      expect(query && rankReferences(references, query)[0].id).toBe(mapping.referenceId)
    })
  })

  it('поддерживает SVG, PNG и WebP preview paths и хранит все назначенные файлы', () => {
    references.forEach((reference) => {
      expect(reference.previewPath).toMatch(/\.(svg|png|webp)$/)
      expect(fs.existsSync(path.resolve('public', reference.previewPath))).toBe(true)
    })
  })

  it('показывает блок первоисточника на detail page', () => {
    const reference = sourceBacked[0]
    render(
      <MemoryRouter initialEntries={[`/reference/${reference.id}`]}>
        <InspirationBoardProvider>
          <Routes><Route path="/reference/:id" element={<ReferencePage references={references} query={null} />} /></Routes>
        </InspirationBoardProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Первоисточник' })).toBeInTheDocument()
    expect(screen.getByText(reference.sourceTitle ?? '')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Открыть первоисточник/ })).toHaveAttribute('href', reference.sourceUrl)
    expect(screen.getByText(/Preview создан PIP/)).toBeInTheDocument()
  })
})

