import type { PipProductReview } from '../../types/sourceReference'

const poReviewedAt = '2026-08-08T00:00:00.000Z'

export const pipProductReviews: PipProductReview[] = [
  {
    sourceReferenceId: 'SRC-0001', semanticFit: 'pass', visualInspiration: 'pass', screenSuitability: 'pass', designFreshness: 'still_relevant',
    pipProductReviewStatus: 'pip_approved', poReviewedAt,
    poNotes: ['Хороший professional comparison/pricing reference.'], rejectionReasons: [],
  },
  {
    sourceReferenceId: 'SRC-0002', semanticFit: 'pass', visualInspiration: 'fail', screenSuitability: 'pass', designFreshness: 'still_relevant',
    pipProductReviewStatus: 'pip_rejected', poReviewedAt,
    poNotes: ['Слишком простой график, недостаточно вдохновляющий.'], rejectionReasons: ['visual_too_simple', 'low_inspiration'],
  },
  {
    sourceReferenceId: 'SRC-0003', semanticFit: 'pass', visualInspiration: 'warning', screenSuitability: 'pass', designFreshness: 'dated',
    pipProductReviewStatus: 'pip_rejected', poReviewedAt,
    poNotes: ['Визуально устаревший timeline / next steps.'], rejectionReasons: ['visually_dated', 'low_inspiration'],
  },
  {
    sourceReferenceId: 'SRC-0004', semanticFit: 'pass', visualInspiration: 'warning', screenSuitability: 'warning', designFreshness: 'still_relevant',
    pipProductReviewStatus: 'pip_rejected', poReviewedAt,
    poNotes: ['Логика подходит, но визуально средне; нет WOW.', 'Права перепроверены: документ прямо указывает Open Government Licence v3.0, поэтому прежняя классификация explicit-permission заменена на other-open-licence.'], rejectionReasons: ['low_inspiration', 'weak_composition'],
  },
  {
    sourceReferenceId: 'SRC-0005', semanticFit: 'pass', visualInspiration: 'warning', screenSuitability: 'fail', designFreshness: 'current',
    pipProductReviewStatus: 'pip_rejected', poReviewedAt,
    poNotes: ['Professional annual-report spread, но слишком document/editorial-like для презентации.'], rejectionReasons: ['document_like', 'screen_unsuitable'],
  },
  {
    sourceReferenceId: 'SRC-0006', semanticFit: 'pass', visualInspiration: 'pass', screenSuitability: 'pass', designFreshness: 'still_relevant',
    pipProductReviewStatus: 'pip_approved', poReviewedAt,
    poNotes: ['Сильный cover; современно воспринимается, но требует наблюдения за freshness.'], rejectionReasons: [],
  },
  {
    sourceReferenceId: 'SRC-0007', semanticFit: 'fail', visualInspiration: 'warning', screenSuitability: 'fail', designFreshness: 'current',
    pipProductReviewStatus: 'pip_rejected', poReviewedAt,
    poNotes: ['Semantic mismatch и document-like layout.'], rejectionReasons: ['semantic_mismatch', 'document_like', 'screen_unsuitable'],
  },
  {
    sourceReferenceId: 'SRC-0008', semanticFit: 'pass', visualInspiration: 'fail', screenSuitability: 'fail', designFreshness: 'still_relevant',
    pipProductReviewStatus: 'pip_rejected', poReviewedAt,
    poNotes: ['Таблица в отчёте, а не презентационный дизайн-референс.'], rejectionReasons: ['document_like', 'screen_unsuitable', 'low_inspiration'],
  },
]

export const pipProductReviewById = new Map(pipProductReviews.map((review) => [review.sourceReferenceId, review]))
