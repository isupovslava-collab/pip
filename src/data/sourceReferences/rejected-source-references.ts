import type { SourceReference, SourceVerificationReview } from '../../types/sourceReference'

const checkedAt = '2026-08-08T07:30:00.000Z'

export const rejectedSourceReferences: SourceReference[] = [
  {
    id: 'SRC-0013', verificationStatus: 'rejected', presentationTitle: 'The secret structure of great talks', originalSlideTitle: null, curatorLabel: 'Speaker profile used as a slide lead', organization: 'TED / Nancy Duarte', author: 'Nancy Duarte', publicationYear: null,
    primaryUrl: 'https://www.ted.com/speakers/nancy_duarte', directDocumentUrl: null, pageNumber: null, slideNumber: null, urlStatus: 'working', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'story', compatibleContentTypeIds: ['cover'], primaryScenarioId: 'speech', scenarioIds: ['speech'], personaIds: ['employees'], goalIds: ['inspire'], styleIds: ['modern'], compositionFamily: 'narrative contrast', visualDirection: 'talk profile', compositionPrinciple: 'Alternation between the current state and a better future.', visualStrength: 'The URL is a speaker profile rather than a concrete presentation page.', rightsStatus: 'unclear', rightsEvidenceUrl: null, reuseRecommendation: 'Do not use as a verified source record.', displayMode: 'source-link-only', researchOrigins: ['manual', 'gemini'], duplicateGroupId: null, verificationNotes: ['The URL opens, but it does not identify the claimed slide.'], rejectionReason: 'source cannot be reliably identified: the lead points to a speaker profile, not a specific presentation page or slide',
  },
  {
    id: 'SRC-0014', verificationStatus: 'rejected', presentationTitle: 'Visual tools for learning', originalSlideTitle: null, curatorLabel: 'Learning roadmap lead', organization: 'The Open University / OpenLearn', author: null, publicationYear: null,
    primaryUrl: 'https://www.open.edu/openlearn/education-development/extending-and-developing-your-thinking-skills/content-section-7.4', directDocumentUrl: null, pageNumber: null, slideNumber: null, urlStatus: 'partial', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'timeline', compatibleContentTypeIds: ['process'], primaryScenarioId: 'training', scenarioIds: ['training'], personaIds: ['employees'], goalIds: ['teach'], styleIds: ['minimal'], compositionFamily: 'learning article', visualDirection: 'text-led course content', compositionPrinciple: 'Learning concepts are explained through article sections.', visualStrength: 'The lead does not provide a strong presentation-style page.', rightsStatus: 'cc-by-nc', rightsEvidenceUrl: 'https://www.open.edu/openlearn/about-openlearn/terms-and-conditions', reuseRecommendation: 'Do not include in the verified visual core.', displayMode: 'source-link-only', researchOrigins: ['manual', 'perplexity'], duplicateGroupId: null, verificationNotes: ['The source is educational content, but the proposed visual is too weak for the verified core.'], rejectionReason: 'visual too weak: the source is a text-led article rather than a professional slide or report-like visual',
  },
  {
    id: 'SRC-0015', verificationStatus: 'rejected', presentationTitle: 'Making decisions playbook examples', originalSlideTitle: null, curatorLabel: 'Decision-table lead', organization: 'Atlassian', author: null, publicationYear: null,
    primaryUrl: 'https://www.atlassian.com/team-playbook/examples/making-decisions', directDocumentUrl: null, pageNumber: null, slideNumber: null, urlStatus: 'working', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'table', compatibleContentTypeIds: ['process'], primaryScenarioId: 'meeting', scenarioIds: ['meeting'], personaIds: ['team', 'manager'], goalIds: ['decide'], styleIds: ['corporate'], compositionFamily: 'decision examples index', visualDirection: 'web example gallery', compositionPrinciple: 'Decision artifacts are grouped by use case.', visualStrength: 'No exact document, page or slide is identified.', rightsStatus: 'unclear', rightsEvidenceUrl: null, reuseRecommendation: 'Keep out of the verified core.', displayMode: 'source-link-only', researchOrigins: ['manual', 'genspark'], duplicateGroupId: null, verificationNotes: ['The lead is an index of examples and cannot support a page-level visual claim.'], rejectionReason: 'wrong source granularity: the URL is an examples index without a verifiable source page or slide',
  },
  {
    id: 'SRC-0016', verificationStatus: 'rejected', presentationTitle: 'Salesforce Investor Day 2022', originalSlideTitle: null, curatorLabel: 'Commercial comparison lead', organization: 'Salesforce', author: null, publicationYear: 2022,
    primaryUrl: 'https://investor.salesforce.com/events-and-presentations/events/event-details/2022/Salesforce-Investor-Day-2022/default.aspx', directDocumentUrl: null, pageNumber: null, slideNumber: null, urlStatus: 'partial', urlCheckedAt: checkedAt,
    primaryContentTypeId: 'comparison', compatibleContentTypeIds: ['kpi'], primaryScenarioId: 'sales', scenarioIds: ['sales'], personaIds: ['client', 'ceo'], goalIds: ['compare_options'], styleIds: ['corporate'], compositionFamily: 'investor event lead', visualDirection: 'corporate investor relations', compositionPrinciple: 'A commercial choice is organized around a clear recommendation.', visualStrength: 'The event page did not yield a stable direct document or exact page during verification.', rightsStatus: 'unclear', rightsEvidenceUrl: null, reuseRecommendation: 'Do not claim a verified slide until the direct document and page are confirmed.', displayMode: 'source-link-only', researchOrigins: ['manual', 'gemini'], duplicateGroupId: null, verificationNotes: ['The event URL is access-restricted for automated verification.', 'No exact page or direct deck was confirmed.'], rejectionReason: 'source cannot be reliably verified: no stable direct document and no exact page were confirmed',
  },
]

export const rejectedSourceVerificationReviews: SourceVerificationReview[] = rejectedSourceReferences.map((source) => ({
  sourceReferenceId: source.id,
  sourceGate: source.id === 'SRC-0013' || source.id === 'SRC-0015' ? 'fail' : 'pass', documentGate: 'fail', pageGate: 'fail', visualGate: 'fail', contentTypeGate: 'fail', scenarioGate: 'pass', rightsGate: 'fail',
  visualReview: 'reject', pipRelevance: 'low', reviewedAt: checkedAt, notes: [source.rejectionReason ?? 'Rejected during manual verification.'],
}))
