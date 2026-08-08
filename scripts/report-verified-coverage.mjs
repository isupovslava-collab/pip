import fs from 'node:fs'
import path from 'node:path'
import { sourceReferences } from '../src/data/sourceReferences/source-references.ts'
import { sourceReferenceSummary } from '../src/lib/referenceVerification/sourceReferenceCoverage.ts'

const root = process.cwd()
const reportsDirectory = path.join(root, 'reports')
fs.mkdirSync(reportsDirectory, { recursive: true })

const summary = sourceReferenceSummary(sourceReferences)
const rightsNames = ['public-domain', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'explicit-permission', 'official-embed', 'link-only-no-local-copy', 'unclear']
const rights = Object.fromEntries(rightsNames.map((name) => [name, summary.rights.find(([key]) => key === name)?.[1] ?? 0]))
const origins = Object.fromEntries(summary.origins)
const report = { generatedAt: new Date().toISOString(), targetPerContentType: 3, targetTotal: 24, ...summary, rights, origins }

const lines = [
  '# VERIFIED REFERENCE COVERAGE', '',
  ...summary.coverage.map(({ contentTypeId, verifiedCount }) => `${contentTypeId}: ${verifiedCount} / 3`), '',
  `Total verified: ${summary.verified} / 24`, '',
  `Unique organizations: ${summary.uniqueOrganizations}`,
  `Unique presentations: ${summary.uniquePresentations}`,
  `Rights breakdown: ${rightsNames.map((name) => `${name}=${rights[name]}`).join(', ')}`,
  `Research origins: ${Object.entries(origins).map(([name, count]) => `${name}=${count}`).join(', ')}`,
  `Rejected: ${summary.rejected}`,
  `Source found: ${summary.sourceFound}`, '',
  '## Coverage detail', '',
  '| contentTypeId | candidateCount | sourceFoundCount | verifiedCount | rejectedCount | gapToTarget3 |',
  '| --- | ---: | ---: | ---: | ---: | ---: |',
  ...summary.coverage.map((row) => `| ${row.contentTypeId} | ${row.candidateCount} | ${row.sourceFoundCount} | ${row.verifiedCount} | ${row.rejectedCount} | ${row.gapToTarget3} |`), '',
  '> Quality gate > quota: every remaining deficit is reported; no record is promoted to verified to fill a quota.',
]

const rejected = sourceReferences.filter(({ verificationStatus }) => verificationStatus === 'rejected').map((source) => ({
  id: source.id,
  source: source.primaryUrl,
  document: source.directDocumentUrl,
  page: source.pageNumber,
  researchOrigins: source.researchOrigins,
  rejectionReason: source.rejectionReason,
}))

fs.writeFileSync(path.join(reportsDirectory, 'verified-reference-coverage.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(reportsDirectory, 'verified-reference-coverage.md'), `${lines.join('\n')}\n`)
fs.writeFileSync(path.join(reportsDirectory, 'rejected-reference-report.json'), `${JSON.stringify({ generatedAt: report.generatedAt, rejected }, null, 2)}\n`)

console.log('VERIFIED REFERENCE COVERAGE')
for (const row of summary.coverage) console.log(`${row.contentTypeId}: ${row.verifiedCount} / 3`)
console.log(`Total verified: ${summary.verified} / 24`)
console.log(`Unique organizations: ${summary.uniqueOrganizations}`)
console.log(`Unique presentations: ${summary.uniquePresentations}`)
console.log(`Rights breakdown: ${rightsNames.map((name) => `${name}=${rights[name]}`).join(', ')}`)
console.log(`Research origins: ${Object.entries(origins).map(([name, count]) => `${name}=${count}`).join(', ')}`)
console.log(`Rejected: ${summary.rejected}`)
console.log(`Source found: ${summary.sourceFound}`)
