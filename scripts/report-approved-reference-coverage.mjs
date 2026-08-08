import fs from 'node:fs'
import path from 'node:path'
import { sourceReferences } from '../src/data/sourceReferences/source-references.ts'
import { productApprovalSummary } from '../src/lib/referenceVerification/productApproval.ts'

const reportsDirectory = path.join(process.cwd(), 'reports')
fs.mkdirSync(reportsDirectory, { recursive: true })
const generatedAt = new Date().toISOString()
const summary = productApprovalSummary(sourceReferences)
const approved = sourceReferences.filter(({ sourceVerificationStatus, pipProductReviewStatus }) => sourceVerificationStatus === 'source_verified' && pipProductReviewStatus === 'pip_approved')
const report = {
  generatedAt,
  targetPerContentType: 3,
  targetTotal: 24,
  sourceVerified: summary.sourceVerified,
  pipApproved: summary.pipApproved,
  pipRejected: summary.pipRejected,
  awaitingPoReview: summary.awaitingPoReview,
  approvedOrganizations: summary.approvedOrganizations,
  approvedPresentations: summary.approvedPresentations,
  approvedReferenceIds: approved.map(({ id }) => id),
  coverage: summary.coverage,
}
const lines = [
  '# PIP APPROVED REFERENCE COVERAGE', '',
  ...summary.coverage.map(({ contentTypeId, sourceVerifiedCount, pipApprovedCount }) => `${contentTypeId}: source verified ${sourceVerifiedCount} · PIP approved ${pipApprovedCount} / 3`), '',
  `Total source verified: ${summary.sourceVerified} / 24`,
  `Total PIP approved: ${summary.pipApproved} / 24`,
  `PIP rejected: ${summary.pipRejected}`,
  `Awaiting PO review: ${summary.awaitingPoReview}`,
  `Approved organizations: ${summary.approvedOrganizations}`,
  `Approved presentations: ${summary.approvedPresentations}`, '',
  '## Production-eligible references', '',
  ...approved.map((source) => `- ${source.id} — ${source.organization}: ${source.presentationTitle}`), '',
  '> Source verification and PIP product approval are independent gates. Only records passing both are production eligible.',
]

fs.writeFileSync(path.join(reportsDirectory, 'approved-reference-coverage.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(reportsDirectory, 'approved-reference-coverage.md'), `${lines.join('\n')}\n`)
console.log(lines.slice(0, -2).join('\n'))
