import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { coverRecoveryRound2Candidates, coverRound1Decisions } from '../data/coverRecoveryCandidates'
import { CoverRecoveryReviewPage } from '../pages/CoverRecoveryReviewPage'
import { COVER_RECOVERY_REVIEW_STORAGE_KEY, createCoverRecoveryReviewExport } from '../services/coverRecoveryReviewStorage'
import { isCuratedCoreEligible } from '../services/selectCuratedCore'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]

describe('Cover Recovery Round 2', () => {
  it('records all four Product Owner Round 1 outcomes', () => {
    expect(coverRound1Decisions).toHaveLength(4)
    expect(coverRound1Decisions.slice(0, 3).every(({ disposition, reviewStatus }) => disposition === 'revise_visual' && reviewStatus === 'revise')).toBe(true)
    expect(coverRound1Decisions[3]).toMatchObject({ candidateId: 'COVER-CAND-004', disposition: 'pending', reviewStatus: 'preferred' })
  })

  it('contains eight review-worthy candidates across five visual families with no production exposure', () => {
    expect(coverRecoveryRound2Candidates).toHaveLength(8)
    expect(new Set(coverRecoveryRound2Candidates.map(({ id }) => id)).size).toBe(8)
    expect(new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily)).size).toBe(5)
    expect(new Set(coverRecoveryRound2Candidates.map(({ compositionFamily }) => compositionFamily)).size).toBe(8)
    coverRecoveryRound2Candidates.forEach((candidate) => expect(candidate).toMatchObject({ width: 1600, height: 900, curatedCoreStatus: 'review_only', productionExposure: false, knownOverlapIssue: false, thirdPartyAssets: false }))
  })

  it.each(['COVER-CAND-001', 'COVER-CAND-002', 'COVER-CAND-003'])('keeps valid Round 2 lineage for %s', (parentCandidateId) => {
    const revisions = coverRecoveryRound2Candidates.filter((candidate) => candidate.parentCandidateId === parentCandidateId)
    expect(revisions).toHaveLength(2)
    expect(revisions.every(({ origin, revisionRound, revisionReason, poFeedbackApplied }) => origin === 'revised' && revisionRound === 2 && Boolean(revisionReason) && Boolean(poFeedbackApplied))).toBe(true)
  })

  it('preserves Candidate 4 and includes REF-000016 as a non-production Story-to-Cover candidate', () => {
    expect(coverRecoveryRound2Candidates.find(({ id }) => id === 'COVER-CAND-004')).toMatchObject({ origin: 'baseline', reviewStatus: 'preferred', previewPath: 'cover-recovery/COVER-CAND-004.svg', productionExposure: false })
    expect(coverRecoveryRound2Candidates.find(({ id }) => id === 'REF-000016')).toMatchObject({ origin: 'reclassified', sourceOrigin: 'reclassified_candidate', currentContentType: 'story', proposedContentType: 'cover', poReviewDisposition: 'reclassify', productionExposure: false })
    expect(references.find(({ id }) => id === 'REF-000016')).toMatchObject({ primaryContentTypeId: 'story', proposedPrimaryContentType: 'cover', curatedCoreStatus: 'review_only', poReviewDisposition: 'reclassify' })
    expect(isCuratedCoreEligible(references.find(({ id }) => id === 'REF-000016')!)).toBe(false)
  })

  it('uses self-contained distinct generated SVG assets with explicit 1600×900 dimensions', () => {
    const generated = coverRecoveryRound2Candidates.filter(({ previewPath }) => previewPath.endsWith('.svg'))
    const assets = generated.map(({ previewPath }) => readFileSync(`public/${previewPath}`, 'utf8'))
    assets.forEach((svg) => {
      expect(svg).toMatch(/<svg[^>]+width="1600"[^>]+height="900"[^>]+viewBox="0 0 1600 900"/)
      expect(svg).not.toMatch(/<image\b|(?:href|xlink:href)="https?:\/\//)
    })
    expect(new Set(assets).size).toBe(generated.length)
  })

  it('keeps exact production counts unchanged, including zero Cover', () => {
    const approved = references.filter(isCuratedCoreEligible)
    const count = (type: Reference['primaryContentTypeId']) => approved.filter(({ primaryContentTypeId }) => primaryContentTypeId === type).length
    expect({ kpi: count('kpi'), comparison: count('comparison'), timeline: count('timeline'), process: count('process'), dashboard: count('dashboard'), cover: count('cover'), story: count('story'), table: count('table') }).toEqual({ kpi: 3, comparison: 2, timeline: 2, process: 3, dashboard: 2, cover: 0, story: 2, table: 3 })
  })

  it('renders Round 2 metadata, stores review locally and makes the 3/3 limit explicit', async () => {
    const user = userEvent.setup()
    render(<CoverRecoveryReviewPage />)
    expect(screen.getByRole('heading', { name: 'Cover Recovery Round 2 Review' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(12)
    expect(screen.getAllByRole('img')).toHaveLength(8)
    expect(screen.getAllByRole('checkbox', { name: /Сравнить/ })).toHaveLength(8)
    expect(screen.getAllByText('image_led_editorial').length).toBeGreaterThan(0)
    await user.selectOptions(screen.getByLabelText('Visual quality COVER-R2-01A'), 'strong')
    await user.selectOptions(screen.getByLabelText('Exact Cover COVER-R2-01A'), 'yes')
    await user.selectOptions(screen.getByLabelText('Would use as inspiration COVER-R2-01A'), 'yes')
    await user.selectOptions(screen.getByLabelText('Decision COVER-R2-01A'), 'approve')
    await user.type(screen.getByLabelText('PO notes COVER-R2-01A'), 'Ready for PO review')
    expect(JSON.parse(localStorage.getItem(COVER_RECOVERY_REVIEW_STORAGE_KEY) ?? '{}')['COVER-R2-01A']).toMatchObject({ visualQuality: 'strong', exactCover: 'yes', wouldUseAsInspiration: 'yes', decision: 'approve', comment: 'Ready for PO review' })

    const compare = screen.getAllByRole('checkbox', { name: /Сравнить/ })
    await user.click(compare[0])
    await user.click(compare[1])
    await user.click(compare[2])
    expect(screen.getByRole('heading', { name: 'Cover Compare Mode' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Можно сравнить максимум 3 варианта')
    expect(compare[3]).toBeDisabled()
    expect(screen.getAllByRole('img', { name: /Compare cover/ })).toHaveLength(3)
  })

  it('exports all Round 2 metadata without applying decisions to production', () => {
    const exported = createCoverRecoveryReviewExport(coverRecoveryRound2Candidates, {}, '2026-08-16T00:00:00.000Z')
    expect(exported).toMatchObject({ schemaVersion: 2, reviewRound: 2, exportedAt: '2026-08-16T00:00:00.000Z', productionApplied: false })
    expect(exported.reviews).toHaveLength(8)
    expect(exported.reviews.find(({ candidateId }) => candidateId === 'REF-000016')).toMatchObject({ origin: 'reclassified', visualFamily: 'image_led_editorial', productionExposure: false })
  })
})
