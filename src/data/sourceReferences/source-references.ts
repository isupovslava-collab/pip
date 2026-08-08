import { candidateSourceVerificationReviews, sourceReferenceCandidates } from './source-reference-candidates.ts'
import { rejectedSourceReferences, rejectedSourceVerificationReviews } from './rejected-source-references.ts'
import { verifiedSourceReferences, verifiedSourceVerificationReviews } from './verified-source-references.ts'

export const sourceReferences = [...verifiedSourceReferences, ...sourceReferenceCandidates, ...rejectedSourceReferences]
export const sourceVerificationReviews = [...verifiedSourceVerificationReviews, ...candidateSourceVerificationReviews, ...rejectedSourceVerificationReviews]

export const sourceVerificationReviewById = new Map(sourceVerificationReviews.map((review) => [review.sourceReferenceId, review]))
export const sourceReferenceById = new Map(sourceReferences.map((source) => [source.id, source]))
