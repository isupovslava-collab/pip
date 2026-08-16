import { readFileSync } from 'node:fs'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import referencesJson from '../../public/data/references.json'
import { coverRecoveryCandidates } from '../data/coverRecoveryCandidates'
import { CoverRecoveryReviewPage } from '../pages/CoverRecoveryReviewPage'
import { COVER_RECOVERY_REVIEW_STORAGE_KEY, createCoverRecoveryReviewExport } from '../services/coverRecoveryReviewStorage'

describe('Cover Recovery Pack', () => {
  it('contains exactly four isolated, distinct 1600×900 PIP-original candidates', () => {
    expect(coverRecoveryCandidates).toHaveLength(4)
    expect(referencesJson).toHaveLength(100)
    expect(new Set(coverRecoveryCandidates.map(({ id }) => id)).size).toBe(4)
    expect(new Set(coverRecoveryCandidates.map(({ compositionFamily }) => compositionFamily)).size).toBe(4)
    expect(new Set(coverRecoveryCandidates.map(({ visualDirection }) => visualDirection)).size).toBe(4)
    coverRecoveryCandidates.forEach((candidate) => expect(candidate).toMatchObject({ width: 1600, height: 900, curatedCoreStatus: 'review_only', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', sourceType: 'pip_original', thirdPartyAssets: false }))
  })

  it('uses self-contained SVG previews with explicit dimensions and no third-party image URLs', () => {
    coverRecoveryCandidates.forEach(({ previewPath }) => {
      const svg = readFileSync(`public/${previewPath}`, 'utf8')
      expect(svg).toMatch(/<svg[^>]+width="1600"[^>]+height="900"[^>]+viewBox="0 0 1600 900"/)
      expect(svg).not.toMatch(/<image\b|(?:href|xlink:href)="https?:\/\//)
    })
  })

  it('renders all candidates and saves a local five-question review', async () => {
    const user = userEvent.setup()
    render(<CoverRecoveryReviewPage />)
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getAllByRole('img')).toHaveLength(4)
    await user.selectOptions(screen.getAllByLabelText('1. Visual quality')[0], 'strong')
    await user.selectOptions(screen.getAllByLabelText('2. Exact Cover')[0], 'yes')
    await user.selectOptions(screen.getAllByLabelText('3. Would use as inspiration')[0], 'yes')
    await user.selectOptions(screen.getAllByLabelText('4. Decision')[0], 'approve')
    await user.type(screen.getByLabelText('Comment COVER-CAND-001'), 'Ready for PO review')
    expect(JSON.parse(localStorage.getItem(COVER_RECOVERY_REVIEW_STORAGE_KEY) ?? '{}')['COVER-CAND-001']).toMatchObject({ visualQuality: 'strong', exactCover: 'yes', wouldUseAsInspiration: 'yes', decision: 'approve', comment: 'Ready for PO review' })
  })

  it('exports all four candidates without applying production changes', () => {
    const exported = createCoverRecoveryReviewExport(coverRecoveryCandidates, {}, '2026-08-16T00:00:00.000Z')
    expect(exported).toMatchObject({ schemaVersion: 1, exportedAt: '2026-08-16T00:00:00.000Z', productionApplied: false })
    expect(exported.reviews).toHaveLength(4)
  })
})
