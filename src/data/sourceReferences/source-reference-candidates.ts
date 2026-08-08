import type { SourceReference, SourceVerificationReview } from '../../types/sourceReference'

const checkedAt = '2026-08-08T07:30:00.000Z'

export const sourceReferenceCandidates: SourceReference[] = [
  {
    id: 'SRC-0009', sourceVerificationStatus: 'source_found', pipProductReviewStatus: 'awaiting_po_review', presentationTitle: 'Create + prepare slides', originalSlideTitle: null, curatorLabel: 'TEDx guidance: one clear idea per slide',
    organization: 'TED', author: null, publicationYear: null,
    primaryUrl: 'https://www.ted.com/participate/organize-a-local-tedx-event/tedx-organizer-guide/speakers-program/prepare-your-speaker/create-prepare-slides', directDocumentUrl: null,
    pageNumber: null, slideNumber: null, urlStatus: 'working', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'story', compatibleContentTypeIds: ['cover'], primaryScenarioId: 'speech', scenarioIds: ['speech'], personaIds: ['employees', 'client'], goalIds: ['inspire'], styleIds: ['minimal', 'modern'],
    compositionFamily: 'single-idea keynote guidance', visualDirection: 'speaker-led minimalism', compositionPrinciple: 'The guidance favors one idea and a restrained amount of supporting text per screen.', visualStrength: 'Useful presentation guidance, but no specific page-level slide visual has been verified.',
    rightsStatus: 'link-only-no-local-copy', licenseName: null, rightsEvidenceUrl: null, reuseRecommendation: 'Link to the guidance only. Do not present it as a verified visual source until a specific page or slide is confirmed.', displayMode: 'source-link-only', sourceStability: 'high',
    researchOrigins: ['manual', 'gemini'], duplicateGroupId: null, verificationNotes: ['Official TED guidance page exists and opens.', 'No pageNumber or slideNumber is available.', 'Visual gate remains incomplete.'], rejectionReason: null,
  },
  {
    id: 'SRC-0010', sourceVerificationStatus: 'source_found', pipProductReviewStatus: 'awaiting_po_review', presentationTitle: 'Pathways to Success', originalSlideTitle: null, curatorLabel: 'Learning pathway from introduction to workplace practice',
    organization: 'The Open University / OpenLearn', author: null, publicationYear: null,
    primaryUrl: 'https://www.open.edu/openlearn/pathway', directDocumentUrl: null,
    pageNumber: null, slideNumber: null, urlStatus: 'partial', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'process', compatibleContentTypeIds: ['timeline'], primaryScenarioId: 'training', scenarioIds: ['training'], personaIds: ['employees', 'team'], goalIds: ['teach'], styleIds: ['modern', 'minimal'],
    compositionFamily: 'learning progression', visualDirection: 'accessible learning pathway', compositionPrinciple: 'The material progresses from orientation through guided practice to independent application.', visualStrength: 'The learning logic is relevant, but a specific page-level presentation visual has not been verified.',
    rightsStatus: 'cc-by-nc', licenseName: 'OpenLearn terms - non-commercial use', rightsEvidenceUrl: 'https://www.open.edu/openlearn/about-openlearn/terms-and-conditions', reuseRecommendation: 'Keep source-link-only for this commercial product unless the exact asset licence and page are confirmed.', displayMode: 'source-link-only', sourceStability: 'medium',
    researchOrigins: ['manual', 'perplexity'], duplicateGroupId: null, verificationNotes: ['The official learning resource was previously confirmed in a browser.', 'Automated access is inconsistent.', 'No specific page or slide is approved.'], rejectionReason: null,
  },
  {
    id: 'SRC-0011', sourceVerificationStatus: 'source_found', pipProductReviewStatus: 'awaiting_po_review', presentationTitle: 'DACI decision-making framework', originalSlideTitle: null, curatorLabel: 'Decision roles and decision deadline framework',
    organization: 'Atlassian', author: null, publicationYear: null,
    primaryUrl: 'https://www.atlassian.com/team-playbook/plays/daci', directDocumentUrl: null,
    pageNumber: null, slideNumber: null, urlStatus: 'working', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'process', compatibleContentTypeIds: ['table'], primaryScenarioId: 'meeting', scenarioIds: ['meeting', 'project'], personaIds: ['manager', 'team'], goalIds: ['decide', 'align'], styleIds: ['corporate', 'modern'],
    compositionFamily: 'decision ownership framework', visualDirection: 'operational team playbook', compositionPrinciple: 'A decision is made actionable by separating driver, approver, contributors and informed stakeholders.', visualStrength: 'The framework is strong, but this record does not identify a verified report or slide page.',
    rightsStatus: 'link-only-no-local-copy', licenseName: null, rightsEvidenceUrl: null, reuseRecommendation: 'Link to the playbook; do not copy its templates or brand components.', displayMode: 'source-link-only', sourceStability: 'high',
    researchOrigins: ['manual', 'genspark'], duplicateGroupId: null, verificationNotes: ['Official Atlassian playbook page opens.', 'Document and page gates are incomplete.', 'Meeting and Strategy Hero references remain review-only.'], rejectionReason: null,
  },
  {
    id: 'SRC-0012', sourceVerificationStatus: 'source_found', pipProductReviewStatus: 'awaiting_po_review', presentationTitle: 'UNICEF Annual Report 2024', originalSlideTitle: null, curatorLabel: 'Annual report achievements and financial results',
    organization: 'UNICEF', author: 'UNICEF', publicationYear: 2025,
    primaryUrl: 'https://www.unicef.org/reports/unicef-annual-report/2024', directDocumentUrl: 'https://www.unicef.org/media/172241/file/unicef-annual-report-2024-en.pdf',
    pageNumber: null, slideNumber: null, urlStatus: 'partial', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'table', compatibleContentTypeIds: ['dashboard', 'story'], primaryScenarioId: 'report', scenarioIds: ['report'], personaIds: ['board', 'cfo'], goalIds: ['explain_results'], styleIds: ['corporate', 'modern'],
    compositionFamily: 'editorial annual report', visualDirection: 'human-centered institutional reporting', compositionPrinciple: 'Achievements, impact stories and financial tables are organized into a consistent editorial system.', visualStrength: 'The publication page and PDF identity are confirmed, but the candidate page has not been selected and reviewed.',
    rightsStatus: 'unclear', licenseName: null, rightsEvidenceUrl: null, reuseRecommendation: 'Show the official link only until a specific page and its rights are checked.', displayMode: 'source-link-only', sourceStability: 'medium',
    researchOrigins: ['manual', 'gemini'], duplicateGroupId: null, verificationNotes: ['Official publication page and English PDF URL were identified.', 'The host rejected automated download during this review.', 'No page-level visual claim is stored.'], rejectionReason: null,
  },
]

export const candidateSourceVerificationReviews: SourceVerificationReview[] = [
  { sourceReferenceId: 'SRC-0009', sourceGate: 'pass', documentGate: 'pass', pageGate: 'fail', visualGate: 'fail', contentTypeGate: 'pass', scenarioGate: 'pass', rightsGate: 'pass', reviewedAt: checkedAt, notes: ['Guidance source exists; page-level visual is not verified.'] },
  { sourceReferenceId: 'SRC-0010', sourceGate: 'pass', documentGate: 'pass', pageGate: 'fail', visualGate: 'fail', contentTypeGate: 'pass', scenarioGate: 'pass', rightsGate: 'pass', reviewedAt: checkedAt, notes: ['Learning source exists; exact visual and licence scope need verification.'] },
  { sourceReferenceId: 'SRC-0011', sourceGate: 'pass', documentGate: 'fail', pageGate: 'fail', visualGate: 'fail', contentTypeGate: 'pass', scenarioGate: 'pass', rightsGate: 'pass', reviewedAt: checkedAt, notes: ['Web playbook exists; no specific report page is claimed.'] },
  { sourceReferenceId: 'SRC-0012', sourceGate: 'pass', documentGate: 'pass', pageGate: 'fail', visualGate: 'fail', contentTypeGate: 'fail', scenarioGate: 'pass', rightsGate: 'fail', reviewedAt: checkedAt, notes: ['Publication identity is confirmed; page, content type and rights remain open.'] },
]
