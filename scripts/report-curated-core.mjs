import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const contentTypes = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table']
const isEligible = (reference) => reference.curatedCoreStatus === 'eligible'
  && reference.visualReferenceQuality === 'premium'
  && reference.contentTypePoVerificationStatus === 'verified'
  && reference.poReviewDisposition === 'approved'
  && reference.screenSuitable === true
  && reference.productionApproved === true
  && (reference.previewMode === 'original_pip_interpretation' ? ['hero', 'gold'].includes(reference.qualityTier) : reference.sourceBacked === true)
const eligible = references.filter(isEligible)
const byContentType = Object.fromEntries(contentTypes.map((type) => {
  const exact = eligible.filter(({ primaryContentTypeId }) => primaryContentTypeId === type)
  const target = type === 'cover' ? 3 : 2
  return [type, { approved: exact.length, compositionFamilies: [...new Set(exact.map(({ compositionFamily }) => compositionFamily))].sort(), visualDirections: [...new Set(exact.map(({ visualDirection }) => visualDirection))].sort(), target, targetGap: Math.max(0, target - exact.length) }]
}))
const queue = (disposition) => references.filter(({ poReviewDisposition }) => poReviewDisposition === disposition).map(({ id }) => id)
const report = {
  report: 'PREMIUM CURATED CORE', physicalReferences: references.length, productionApprovedTotal: eligible.length,
  maxProductionResults: 3, exactOnly: true, premiumOnly: true, poTypeVerifiedOnly: true, poApprovedOnly: true,
  byContentType,
  byCompositionFamily: Object.fromEntries([...new Set(eligible.map(({ compositionFamily }) => compositionFamily))].sort().map((family) => [family, eligible.filter(({ compositionFamily }) => compositionFamily === family).length])),
  byVisualDirection: Object.fromEntries([...new Set(eligible.map(({ visualDirection }) => visualDirection))].sort().map((direction) => [direction, eligible.filter(({ visualDirection }) => visualDirection === direction).length])),
  reclassificationQueue: queue('reclassify'), reviseQueue: queue('revise_visual'), rejectedSchematicCount: queue('rejected_schematic').length, rejectedQualityCount: queue('rejected_quality').length, pendingCount: queue('pending').length,
  eligibleIds: eligible.map(({ id }) => id).sort(),
}
const lines = ['# PREMIUM CURATED CORE', '', `Physical references: ${report.physicalReferences}`, `Production approved total: ${report.productionApprovedTotal}`, `Reclassification queue: ${report.reclassificationQueue.join(', ') || 'none'}`, `Revise queue: ${report.reviseQueue.join(', ') || 'none'}`, `Rejected schematic: ${report.rejectedSchematicCount}`, `Rejected quality: ${report.rejectedQualityCount}`, `Pending: ${report.pendingCount}`, 'Maximum production results: 3', 'Exact / Premium / PO type verified / PO approved: PASS', '', '## Production coverage', '', '| Type | Approved | Families | Visual directions | Target gap |', '| --- | ---: | --- | --- | ---: |', ...Object.entries(byContentType).map(([type, row]) => `| ${type} | ${row.approved} | ${row.compositionFamilies.join(', ') || 'none'} | ${row.visualDirections.join(', ') || 'none'} | ${row.targetGap} |`), '', `Eligible IDs: ${report.eligibleIds.join(', ')}`, '']
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/curated-core.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/curated-core.md'), lines.join('\n'))
console.log(lines.join('\n'))
