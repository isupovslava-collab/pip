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
console.log(`Source verified: ${sourceReferences.filter(({ sourceVerificationStatus }) => sourceVerificationStatus === 'source_verified').length}`)
console.log(`Source found: ${sourceReferences.filter(({ sourceVerificationStatus }) => sourceVerificationStatus === 'source_found').length}`)
console.log(`Source rejected: ${sourceReferences.filter(({ sourceVerificationStatus }) => sourceVerificationStatus === 'source_rejected').length}`)
