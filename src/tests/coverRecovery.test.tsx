import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { coverRecoveryRound2Candidates, coverRound1Decisions, coverRound2FinalDecisionLog, coverRound2FinalDecisions } from '../data/coverRecoveryCandidates'
import { CoverRecoveryReviewPage } from '../pages/CoverRecoveryReviewPage'
import { COVER_RECOVERY_REVIEW_STORAGE_KEY, createCoverRecoveryReviewExport } from '../services/coverRecoveryReviewStorage'
import { isCuratedCoreEligible, selectCuratedCore } from '../services/selectCuratedCore'
import type { Reference } from '../types/reference'

const references = referencesJson as Reference[]

describe('Cover Recovery Round 2', () => {
  it('records all four Product Owner Round 1 outcomes', () => {
    expect(coverRound1Decisions).toHaveLength(4)
    expect(coverRound1Decisions.slice(0, 3).every(({ disposition, reviewStatus }) => disposition === 'revise_visual' && reviewStatus === 'revise')).toBe(true)
    expect(coverRound1Decisions[3]).toMatchObject({ candidateId: 'COVER-CAND-004', disposition: 'pending', reviewStatus: 'preferred' })
  })

  it('preserves the eight-candidate audit pack across five visual families', () => {
    expect(coverRecoveryRound2Candidates).toHaveLength(8)
    expect(new Set(coverRecoveryRound2Candidates.map(({ id }) => id)).size).toBe(8)
    expect(new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily)).size).toBe(5)
    expect(new Set(coverRecoveryRound2Candidates.map(({ compositionFamily }) => compositionFamily)).size).toBe(8)
    coverRecoveryRound2Candidates.forEach((candidate) => expect(candidate).toMatchObject({ width: 1600, height: 900, curatedCoreStatus: 'review_only', productionExposure: false, thirdPartyAssets: false }))
    expect(coverRecoveryRound2Candidates.filter(({ knownOverlapIssue }) => knownOverlapIssue).map(({ id }) => id)).toEqual(['COVER-R2-03B'])
  })

  it.each(['COVER-CAND-001', 'COVER-CAND-002', 'COVER-CAND-003'])('keeps valid Round 2 lineage for %s', (parentCandidateId) => {
    const revisions = coverRecoveryRound2Candidates.filter((candidate) => candidate.parentCandidateId === parentCandidateId)
    expect(revisions).toHaveLength(2)
    expect(revisions.every(({ origin, revisionRound, revisionReason, poFeedbackApplied }) => origin === 'revised' && revisionRound === 2 && Boolean(revisionReason) && Boolean(poFeedbackApplied))).toBe(true)
  })

  it('applies three final approvals while preserving candidate lineage', () => {
    expect(coverRecoveryRound2Candidates.find(({ id }) => id === 'COVER-CAND-004')).toMatchObject({ origin: 'baseline', reviewStatus: 'preferred', previewPath: 'cover-recovery/COVER-CAND-004.svg', productionExposure: false })
    expect(coverRecoveryRound2Candidates.find(({ id }) => id === 'REF-000016')).toMatchObject({ origin: 'reclassified', sourceOrigin: 'reclassified_candidate', currentContentType: 'story', proposedContentType: 'cover', poReviewDisposition: 'reclassify', productionExposure: false })
    expect(coverRound2FinalDecisions.filter(({ decision }) => decision === 'approved').map(({ productionReferenceId }) => productionReferenceId)).toEqual(['REF-000016', 'REF-000017', 'REF-000047'])
    expect(coverRound2FinalDecisions.find(({ decision }) => decision === 'revise_visual')).toMatchObject({ candidateId: 'COVER-R2-03B', productionReferenceId: null })
    expect(references.find(({ id }) => id === 'REF-000016')).toMatchObject({ primaryContentTypeId: 'cover', curatedCoreStatus: 'eligible', poReviewDisposition: 'approved' })
    expect(isCuratedCoreEligible(references.find(({ id }) => id === 'REF-000016')!)).toBe(true)
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

  it('adds exactly three approved Cover references without changing other production counts', () => {
    const approved = references.filter(isCuratedCoreEligible)
    const count = (type: Reference['primaryContentTypeId']) => approved.filter(({ primaryContentTypeId }) => primaryContentTypeId === type).length
    expect({ kpi: count('kpi'), comparison: count('comparison'), timeline: count('timeline'), process: count('process'), dashboard: count('dashboard'), cover: count('cover'), story: count('story'), table: count('table') }).toEqual({ kpi: 3, comparison: 2, timeline: 2, process: 3, dashboard: 2, cover: 3, story: 2, table: 3 })
  })

  it('returns only the three approved Cover references in production selection', () => {
    const result = selectCuratedCore(references, { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'modern', contentTypeId: 'cover' })
    expect(result.map(({ id }) => id).sort()).toEqual(['REF-000016', 'REF-000017', 'REF-000047'])
    expect(result.every(({ primaryContentTypeId, productionApproved }) => primaryContentTypeId === 'cover' && productionApproved)).toBe(true)
    expect(result.some(({ title }) => title === '2027')).toBe(false)
  })

  it('renders Round 2 metadata, stores review locally and makes the 3/3 limit explicit', async () => {
    const user = userEvent.setup()
    render(<CoverRecoveryReviewPage />)
    expect(screen.getByRole('heading', { name: 'Cover Round 2 Final Decisions' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(16)
    expect(screen.getAllByRole('img')).toHaveLength(8)
    expect(screen.getAllByRole('checkbox', { name: /Сравнить/ })).toHaveLength(8)
    expect(screen.getAllByText('image_led_editorial').length).toBeGreaterThan(0)
    await user.selectOptions(screen.getByLabelText('Visual quality COVER-R2-01A'), 'strong')
    await user.selectOptions(screen.getByLabelText('Exact Cover COVER-R2-01A'), 'yes')
    await user.selectOptions(screen.getByLabelText('Would use as inspiration COVER-R2-01A'), 'yes')
    await user.selectOptions(screen.getByLabelText('Local review decision COVER-R2-01A'), 'approve')
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

  it('exports the immutable final PO audit alongside local review notes', () => {
    const exported = createCoverRecoveryReviewExport(coverRecoveryRound2Candidates, {}, '2026-08-16T00:00:00.000Z')
    expect(exported).toMatchObject({ schemaVersion: 3, reviewRound: 'cover-round-2-final', exportedAt: '2026-08-16T00:00:00.000Z', productionApplied: true, authoritativeDecisionLog: coverRound2FinalDecisionLog })
    expect(exported.reviews).toHaveLength(8)
    expect(exported.reviews.find(({ candidateId }) => candidateId === 'REF-000016')).toMatchObject({ origin: 'reclassified', visualFamily: 'image_led_editorial', productionExposure: true, finalPoDecision: { decision: 'approved', productionReferenceId: 'REF-000016' } })
    expect(exported.reviews.find(({ candidateId }) => candidateId === 'COVER-R2-03B')).toMatchObject({ productionExposure: false, finalPoDecision: { decision: 'revise_visual', productionReferenceId: null } })
  })
})
