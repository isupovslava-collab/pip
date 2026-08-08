import { sourceReferences, sourceVerificationReviews } from '../src/data/sourceReferences/source-references.ts'
import { validateSourceReferences } from '../src/lib/referenceVerification/validateSourceReferences.ts'

const errors = validateSourceReferences(sourceReferences, sourceVerificationReviews)
if (errors.length) {
  console.error('VERIFIED REFERENCE VALIDATION: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('VERIFIED REFERENCE VALIDATION: PASS')
console.log(`Normalized records: ${sourceReferences.length}`)
console.log(`Verified: ${sourceReferences.filter(({ verificationStatus }) => verificationStatus === 'verified').length}`)
console.log(`Source found: ${sourceReferences.filter(({ verificationStatus }) => verificationStatus === 'source_found').length}`)
console.log(`Rejected: ${sourceReferences.filter(({ verificationStatus }) => verificationStatus === 'rejected').length}`)
