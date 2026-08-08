import { pipProductReviews, sourceReferences } from '../src/data/sourceReferences/source-references.ts'
import { productApprovalSummary, validateProductApproval } from '../src/lib/referenceVerification/productApproval.ts'

const errors = validateProductApproval(sourceReferences, pipProductReviews)
if (errors.length) {
  console.error('PRODUCT APPROVAL VALIDATION: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const summary = productApprovalSummary(sourceReferences)
console.log('PRODUCT APPROVAL VALIDATION: PASS')
console.log(`Source verified: ${summary.sourceVerified}`)
console.log(`PIP approved: ${summary.pipApproved}`)
console.log(`PIP rejected: ${summary.pipRejected}`)
console.log(`Awaiting PO review: ${summary.awaitingPoReview}`)
console.log('Production eligible: SRC-0001, SRC-0006')
