import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const contentTypes = ['dashboard', 'timeline', 'cover', 'kpi', 'comparison', 'process', 'story', 'table']
const byType = Object.fromEntries(contentTypes.map((type) => [type, references.filter(({ poReviewDisposition, primaryContentTypeId }) => poReviewDisposition === 'approved' && primaryContentTypeId === type).length]))
const byDisposition = Object.fromEntries(['approved', 'reclassify', 'revise_visual', 'rejected_schematic', 'rejected_wrong_type', 'rejected_quality', 'pending'].map((disposition) => [disposition, references.filter(({ poReviewDisposition }) => poReviewDisposition === disposition).length]))
const report = {
  report: 'PO REVIEW ROUND 1',
  round: 'sprint-9-1-manual',
  physicalReferences: references.length,
  approvedTotal: byDisposition.approved,
  byType,
  byDisposition,
  reviewEfficiency: {
    reviewed: references.length - byDisposition.pending,
    approved: byDisposition.approved,
    reclassified: byDisposition.reclassify,
    rejectedSchematic: byDisposition.rejected_schematic,
    rejectedQuality: byDisposition.rejected_quality,
    interpretation: 'Diagnostic of PO review workload only; not a market KPI.',
  },
}
const lines = [
  '# PO REVIEW ROUND 1', '',
  ...contentTypes.map((type) => `${type[0].toUpperCase()}${type.slice(1)}: ${byType[type]}`),
  `Total approved: ${report.approvedTotal}`, '',
  `Reclassify: ${byDisposition.reclassify}`,
  `Revise visual: ${byDisposition.revise_visual}`,
  `Rejected schematic: ${byDisposition.rejected_schematic}`,
  `Rejected quality: ${byDisposition.rejected_quality}`,
  `Pending: ${byDisposition.pending}`, '',
  '## PO Review Efficiency', '',
  `Reviewed: ${report.reviewEfficiency.reviewed}`,
  `Approved: ${report.reviewEfficiency.approved}`,
  `Reclassified: ${report.reviewEfficiency.reclassified}`,
  `Rejected schematic: ${report.reviewEfficiency.rejectedSchematic}`,
  `Rejected quality: ${report.reviewEfficiency.rejectedQuality}`,
  '', report.reviewEfficiency.interpretation, '',
]
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/po-review-round-1.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/po-review-round-1.md'), lines.join('\n'))
console.log(lines.join('\n'))
