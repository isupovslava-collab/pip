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
const productionEligible = references.filter(isEligible)
const coverageGaps = Object.fromEntries(contentTypes.map((type) => {
  const exact = productionEligible.filter(({ primaryContentTypeId }) => primaryContentTypeId === type)
  return [type, { approved: exact.length, target: 2, gap: Math.max(0, 2 - exact.length) }]
}))
const compositionDuplicateWarnings = contentTypes.flatMap((type) => {
  const families = productionEligible.filter(({ primaryContentTypeId }) => primaryContentTypeId === type).map(({ compositionFamily }) => compositionFamily)
  const duplicates = [...new Set(families.filter((family, index) => families.indexOf(family) !== index))]
  return duplicates.map((compositionFamily) => ({ contentType: type, compositionFamily }))
})
const knownMisclassifications = references
  .filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'reclassify')
  .map(({ id, primaryContentTypeId, proposedPrimaryContentType, contentTypePoNotes }) => ({ id, currentType: primaryContentTypeId, proposedType: proposedPrimaryContentType, notes: contentTypePoNotes }))
const report = {
  report: 'CURATED CORE CALIBRATION',
  totalCandidates: references.length,
  visualPremium: references.filter(({ visualReferenceQuality }) => visualReferenceQuality === 'premium').length,
  typeVerified: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'verified').length,
  pending: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'pending').length,
  reclassify: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'reclassify').length,
  rejected: references.filter(({ contentTypePoVerificationStatus }) => contentTypePoVerificationStatus === 'rejected').length,
  productionEligible: productionEligible.length,
  knownMisclassifications,
  coverageTargetPerType: 2,
  coverageTargetIsBinding: false,
  coverageGaps,
  compositionDuplicateWarnings,
}
const lines = [
  '# CURATED CORE CALIBRATION', '',
  `Total candidates: ${report.totalCandidates}`,
  `Visual premium: ${report.visualPremium}`,
  `Type verified: ${report.typeVerified}`,
  `Pending: ${report.pending}`,
  `Reclassify: ${report.reclassify}`,
  `Rejected: ${report.rejected}`,
  `Production eligible: ${report.productionEligible}`,
  `Known misclassifications: ${report.knownMisclassifications.length}`,
  `Composition duplicate warnings: ${report.compositionDuplicateWarnings.length}`, '',
  '## Coverage gaps', '',
  '| Content type | Approved | Target | Gap |',
  '| --- | ---: | ---: | ---: |',
  ...Object.entries(coverageGaps).map(([type, row]) => `| ${type} | ${row.approved} | ${row.target} | ${row.gap} |`), '',
  'Target is aspirational and non-binding; quality wins over quantity.', '',
  '## Known misclassifications', '',
  ...(knownMisclassifications.length ? knownMisclassifications.map((item) => `- ${item.id}: ${item.currentType} → ${item.proposedType ?? 'not proposed'} — ${item.notes ?? ''}`) : ['None']), '',
]
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/curated-core-calibration.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/curated-core-calibration.md'), lines.join('\n'))
console.log(lines.join('\n'))
