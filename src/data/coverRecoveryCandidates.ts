import coverRound2FinalJson from './curatedCore/cover-round-2-final.json'

export type CoverVisualFamily = 'image_led_editorial' | 'typographic_bold' | 'atmospheric_abstract' | 'large_year_editorial' | 'minimal_statement'
export type CoverCandidateOrigin = 'baseline' | 'revised' | 'reclassified'
export type CoverReviewStatus = 'review_ready' | 'preferred'
export type CoverFinalDecision = 'approved' | 'revise_visual'
export type CoverFinalPriority = 'primary_hero' | 'secondary' | 'secondary_minimal' | 'not_production_ready'

export interface CoverRound2FinalDecision {
  rank: 1 | 2 | 3 | 4
  candidateId: string
  productionReferenceId: string | null
  decision: CoverFinalDecision
  priority: CoverFinalPriority
  title: string
  notes: string
}

export interface CoverRound2FinalDecisionLog {
  round: 'cover-round-2-final'
  reviewedAt: string
  reviewedBy: 'product_owner'
  decisions: CoverRound2FinalDecision[]
  notSelectedCandidateIds: string[]
}

export interface CoverRound1Decision {
  candidateId: `COVER-CAND-00${1 | 2 | 3 | 4}`
  title: string
  disposition: 'revise_visual' | 'pending'
  reviewStatus: 'revise' | 'preferred'
  notes: string
}

export interface CoverRecoveryCandidate {
  id: string
  title: string
  visualFamily: CoverVisualFamily
  visualDirection: string
  compositionFamily: string
  origin: CoverCandidateOrigin
  sourceOrigin: 'pip_original' | 'reclassified_candidate'
  parentCandidateId?: CoverRound1Decision['candidateId']
  revisionRound?: 2
  revisionReason?: string
  poFeedbackApplied: string
  rationale: string
  previewPath: string
  width: 1600
  height: 900
  productionExposure: false
  knownOverlapIssue: boolean
  reviewStatus: CoverReviewStatus
  curatedCoreStatus: 'review_only'
  visualReferenceQuality: 'good' | 'premium'
  contentTypePoVerificationStatus: 'pending' | 'reclassify'
  poReviewDisposition: 'pending' | 'reclassify'
  currentContentType: 'cover' | 'story'
  proposedContentType: 'cover'
  thirdPartyAssets: false
}

export const coverRound1Decisions: CoverRound1Decision[] = [
  { candidateId: 'COVER-CAND-001', title: 'Новый масштаб начинается с ясного выбора', disposition: 'revise_visual', reviewStatus: 'revise', notes: 'Правая абстрактная часть слабая. Нужен более сильный и содержательный visual anchor. Геометрия не должна выглядеть как filler.' },
  { candidateId: 'COVER-CAND-002', title: 'Стратегия без лишнего', disposition: 'revise_visual', reviewStatus: 'revise', notes: 'Типографика хорошая, но геометрия справа выглядит лишней. Нужен либо сильный pure-typography cover, либо controlled meaningful visual accent.' },
  { candidateId: 'COVER-CAND-003', title: 'План роста 2027', disposition: 'revise_visual', reviewStatus: 'revise', notes: 'Сильная идея large-year cover. Сохранить принцип, убрать случайный overlap и довести композицию до premium уровня.' },
  { candidateId: 'COVER-CAND-004', title: 'Следующий рубеж ближе, чем кажется', disposition: 'pending', reviewStatus: 'preferred', notes: 'Сильный цельный baseline. Сохранить без auto-production до явного Round 2 решения Product Owner.' },
]

export const coverRound2FinalDecisionLog = coverRound2FinalJson as CoverRound2FinalDecisionLog
export const coverRound2FinalDecisions = coverRound2FinalDecisionLog.decisions

const common = { width: 1600 as const, height: 900 as const, productionExposure: false as const, knownOverlapIssue: false as const, curatedCoreStatus: 'review_only' as const, thirdPartyAssets: false as const, proposedContentType: 'cover' as const }

export const coverRecoveryRound2Candidates: CoverRecoveryCandidate[] = [
  { ...common, id: 'COVER-R2-01A', title: 'Новый масштаб начинается с ясного выбора', visualFamily: 'image_led_editorial', visualDirection: 'editorial-horizon-scene', compositionFamily: 'split-editorial-horizon', origin: 'revised', sourceOrigin: 'pip_original', parentCandidateId: 'COVER-CAND-001', revisionRound: 2, revisionReason: 'Replace weak right-side geometry with a meaningful image-like horizon and forward path.', poFeedbackApplied: 'Meaningful visual anchor replaces arbitrary geometry; light and perspective communicate movement and scale.', rationale: 'Headline and atmospheric horizon form one opening story about a consequential choice and forward movement.', previewPath: 'cover-recovery/COVER-R2-01A.svg', reviewStatus: 'review_ready', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover' },
  { ...common, id: 'COVER-R2-01B', title: 'Новый масштаб начинается с ясного выбора', visualFamily: 'atmospheric_abstract', visualDirection: 'luminous-perspective-depth', compositionFamily: 'immersive-light-field', origin: 'revised', sourceOrigin: 'pip_original', parentCandidateId: 'COVER-CAND-001', revisionRound: 2, revisionReason: 'Rebuild the abstract direction around depth, light, perspective and purposeful movement.', poFeedbackApplied: 'Random shapes removed; the visual now behaves as a single atmospheric environment and focal path.', rationale: 'A controlled light field creates depth and ambition while leaving the thesis dominant and readable.', previewPath: 'cover-recovery/COVER-R2-01B.svg', reviewStatus: 'review_ready', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover' },
  { ...common, id: 'COVER-R2-02A', title: 'Стратегия без лишнего', visualFamily: 'typographic_bold', visualDirection: 'pure-editorial-typography', compositionFamily: 'asymmetric-type-led-cover', origin: 'revised', sourceOrigin: 'pip_original', parentCandidateId: 'COVER-CAND-002', revisionRound: 2, revisionReason: 'Remove decorative right-side geometry and let typography carry the entire composition.', poFeedbackApplied: 'Pure typography, confident whitespace and one micro-accent replace the unnecessary geometric filler.', rationale: 'Scale, contrast and pacing turn a short executive thesis into a memorable, self-sufficient cover.', previewPath: 'cover-recovery/COVER-R2-02A.svg', reviewStatus: 'review_ready', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover' },
  { ...common, id: 'COVER-R2-02B', title: 'Стратегия без лишнего', visualFamily: 'typographic_bold', visualDirection: 'type-with-controlled-light-accent', compositionFamily: 'cropped-type-light-column', origin: 'revised', sourceOrigin: 'pip_original', parentCandidateId: 'COVER-CAND-002', revisionRound: 2, revisionReason: 'Integrate one controlled dimensional accent into the typographic hierarchy.', poFeedbackApplied: 'The single light column is structurally aligned with the headline and no longer behaves as detached decoration.', rationale: 'Editorial cropping and one light accent add depth without competing with the strategic statement.', previewPath: 'cover-recovery/COVER-R2-02B.svg', reviewStatus: 'review_ready', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover' },
  { ...common, id: 'COVER-R2-03A', title: 'План роста 2027', visualFamily: 'large_year_editorial', visualDirection: 'clean-oversized-year', compositionFamily: 'year-anchor-safe-zone', origin: 'revised', sourceOrigin: 'pip_original', parentCandidateId: 'COVER-CAND-003', revisionRound: 2, revisionReason: 'Preserve the large-year idea while separating the title into a clear safe zone.', poFeedbackApplied: 'Accidental overlap removed; the 2027 anchor and title now have independent, readable zones.', rationale: 'The oversized year makes the planning horizon instantly legible while the lower editorial band carries context.', previewPath: 'cover-recovery/COVER-R2-03A.svg', reviewStatus: 'review_ready', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover' },
  { ...common, id: 'COVER-R2-03B', title: 'План роста 2027', visualFamily: 'large_year_editorial', visualDirection: 'intentional-editorial-overlap', compositionFamily: 'year-crop-contrast-caption', origin: 'revised', sourceOrigin: 'pip_original', parentCandidateId: 'COVER-CAND-003', revisionRound: 2, revisionReason: 'Turn the former collision into a deliberate editorial crop with controlled contrast.', poFeedbackApplied: 'Overlap was intended, but final PO review found that the caption still conflicts with the year and requires another revision.', rationale: 'The dark large-year direction remains promising, but the title block must move below the digits before production approval.', previewPath: 'cover-recovery/COVER-R2-03B.svg', reviewStatus: 'review_ready', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover', knownOverlapIssue: true },
  { ...common, id: 'COVER-CAND-004', title: 'Следующий рубеж ближе, чем кажется', visualFamily: 'minimal_statement', visualDirection: 'cinematic-opening-statement', compositionFamily: 'cinematic-statement-cover', origin: 'baseline', sourceOrigin: 'pip_original', poFeedbackApplied: 'Preserved unchanged as the strongest Round 1 baseline.', rationale: 'Short statement, controlled light and spacious composition already read as a finished opening slide.', previewPath: 'cover-recovery/COVER-CAND-004.svg', reviewStatus: 'preferred', visualReferenceQuality: 'good', contentTypePoVerificationStatus: 'pending', poReviewDisposition: 'pending', currentContentType: 'cover' },
  { ...common, id: 'REF-000016', title: 'Будущее не случается. Мы переходим в него.', visualFamily: 'image_led_editorial', visualDirection: 'emotional-image-led-opening', compositionFamily: 'keynote-photographic-statement', origin: 'reclassified', sourceOrigin: 'reclassified_candidate', revisionReason: 'Move the strong opening statement from Story into Cover review without changing production metadata.', poFeedbackApplied: 'Included as the image-led Cover candidate requested by Product Owner; classification remains pending review.', rationale: 'Large headline, image-led atmosphere and generous whitespace make the intent clear before metadata is read.', previewPath: 'previews/REF-000016.png', reviewStatus: 'review_ready', visualReferenceQuality: 'premium', contentTypePoVerificationStatus: 'reclassify', poReviewDisposition: 'reclassify', currentContentType: 'story' },
]

export const coverRecoveryCandidates = coverRecoveryRound2Candidates
