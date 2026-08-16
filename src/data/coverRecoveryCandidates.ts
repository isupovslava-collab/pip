export interface CoverRecoveryCandidate {
  id: `COVER-CAND-00${1 | 2 | 3 | 4}`
  title: string
  visualDirection: string
  compositionFamily: string
  previewPath: string
  width: 1600
  height: 900
  curatedCoreStatus: 'review_only'
  visualReferenceQuality: 'good'
  contentTypePoVerificationStatus: 'pending'
  poReviewDisposition: 'pending'
  sourceType: 'pip_original'
  thirdPartyAssets: false
}

export const coverRecoveryCandidates: CoverRecoveryCandidate[] = [
  { id: 'COVER-CAND-001', title: 'Новый масштаб начинается с ясного выбора', visualDirection: 'editorial-premium-atmosphere', compositionFamily: 'editorial-visual-cover', previewPath: 'cover-recovery/COVER-CAND-001.svg', width: 1600, height: 900, curatedCoreStatus: 'review_only', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', sourceType: 'pip_original', thirdPartyAssets: false },
  { id: 'COVER-CAND-002', title: 'Стратегия без лишнего', visualDirection: 'premium-minimal-typography', compositionFamily: 'oversized-typographic-cover', previewPath: 'cover-recovery/COVER-CAND-002.svg', width: 1600, height: 900, curatedCoreStatus: 'review_only', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', sourceType: 'pip_original', thirdPartyAssets: false },
  { id: 'COVER-CAND-003', title: 'План роста 2027', visualDirection: 'premium-corporate-year-motif', compositionFamily: 'oversized-numeric-cover', previewPath: 'cover-recovery/COVER-CAND-003.svg', width: 1600, height: 900, curatedCoreStatus: 'review_only', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', sourceType: 'pip_original', thirdPartyAssets: false },
  { id: 'COVER-CAND-004', title: 'Следующий рубеж ближе, чем кажется', visualDirection: 'cinematic-opening-statement', compositionFamily: 'cinematic-statement-cover', previewPath: 'cover-recovery/COVER-CAND-004.svg', width: 1600, height: 900, curatedCoreStatus: 'review_only', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', sourceType: 'pip_original', thirdPartyAssets: false },
]
