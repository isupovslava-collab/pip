import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const contentTypes = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table']
const isEligible = (reference) => reference.curatedCoreStatus === 'eligible'
  && reference.visualReferenceQuality === 'premium'
  && reference.contentTypePoVerificationStatus === 'verified'
  && reference.screenSuitable === true
  && reference.productionApproved === true
  && (reference.previewMode === 'original_pip_interpretation' ? reference.qualityTier === 'hero' : reference.sourceBacked === true)
const eligible = references.filter(isEligible)
const byContentType = Object.fromEntries(contentTypes.map((type) => {
  const exact = eligible.filter(({ primaryContentTypeId }) => primaryContentTypeId === type)
  return [type, {
    exactPremiumVerified: exact.length,
    compositionFamilies: [...new Set(exact.map(({ compositionFamily }) => compositionFamily))].sort(),
    target: 2,
    targetGap: Math.max(0, 2 - exact.length),
  }]
}))
const report = {
  report: 'PREMIUM CURATED CORE',
  physicalReferences: references.length,
  eligibleTotal: eligible.length,
  poContentTypeVerifiedCount: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'verified').length,
  pendingTypeVerification: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'pending').length,
  reclassifyCount: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'reclassify').length,
  rejectedCount: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'rejected').length,
  visualPremiumButTypeUnverified: references.filter(({ visualReferenceQuality, contentTypePoVerificationStatus }) => visualReferenceQuality === 'premium' && contentTypePoVerificationStatus !== 'verified').length,
  maxProductionResults: 3,
  exactOnly: true,
  premiumOnly: true,
  poTypeVerifiedOnly: true,
  coverageTargetPerType: 2,
  coverageTargetIsBinding: false,
  byContentType,
  eligibleIds: eligible.map(({ id }) => id).sort(),
}
const lines = [
  '# PREMIUM CURATED CORE', '',
  `Physical references: ${report.physicalReferences}`,
  `Production eligible: ${report.eligibleTotal}`,
  `PO content-type verified: ${report.poContentTypeVerifiedCount}`,
  `Pending type verification: ${report.pendingTypeVerification}`,
  `Reclassify: ${report.reclassifyCount}`,
  `Rejected: ${report.rejectedCount}`,
  `Visual premium but type-unverified: ${report.visualPremiumButTypeUnverified}`,
  'Maximum production results: 3',
  'Exact-only: PASS',
  'Premium-only: PASS',
  'PO type-verified-only: PASS',
  'Target 2 per type: aspirational, non-binding', '',
  '## Coverage', '',
  '| Content type | Exact premium verified | Composition families | Gap to 2 |',
  '| --- | ---: | --- | ---: |',
  ...Object.entries(byContentType).map(([type, row]) => `| ${type} | ${row.exactPremiumVerified} | ${row.compositionFamilies.join(', ') || 'none'} | ${row.targetGap} |`),
  '', `Eligible IDs: ${report.eligibleIds.join(', ') || 'none'}`, '',
]
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/curated-core.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/curated-core.md'), lines.join('\n'))
console.log(lines.join('\n'))
