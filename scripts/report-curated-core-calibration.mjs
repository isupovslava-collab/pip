import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const contentTypes = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table']
const production = references.filter(({ curatedCoreStatus, visualReferenceQuality, contentTypePoVerificationStatus, poReviewDisposition }) => curatedCoreStatus === 'eligible' && visualReferenceQuality === 'premium' && contentTypePoVerificationStatus === 'verified' && poReviewDisposition === 'approved')
const coverageGaps = Object.fromEntries(contentTypes.map((type) => { const approved = production.filter(({ primaryContentTypeId }) => primaryContentTypeId === type).length; const target = type === 'cover' ? 3 : 2; return [type, { approved, target, gap: Math.max(0, target - approved) }] }))
const compositionDuplicateWarnings = contentTypes.flatMap((type) => { const families = production.filter(({ primaryContentTypeId }) => primaryContentTypeId === type).map(({ compositionFamily }) => compositionFamily); return [...new Set(families.filter((family, index) => families.indexOf(family) !== index))].map((compositionFamily) => ({ contentType: type, compositionFamily })) })
const reclassificationQueue = references.filter(({ poReviewDisposition }) => poReviewDisposition === 'reclassify').map(({ id, primaryContentTypeId, proposedPrimaryContentType, poReviewNotes }) => ({ id, currentType: primaryContentTypeId, proposedType: proposedPrimaryContentType ?? null, notes: poReviewNotes }))
const dispositions = Object.fromEntries(['approved', 'reclassify', 'revise_visual', 'rejected_schematic', 'rejected_wrong_type', 'rejected_quality', 'pending'].map((value) => [value, references.filter(({ poReviewDisposition }) => poReviewDisposition === value).length]))
const report = { report: 'CURATED CORE CALIBRATION', totalCandidates: references.length, productionEligible: production.length, dispositions, reclassificationQueue, reviseQueue: references.filter(({ poReviewDisposition }) => poReviewDisposition === 'revise_visual').map(({ id }) => id), coverageGaps, coverageTargetIsBinding: false, compositionDuplicateWarnings }
const lines = ['# CURATED CORE CALIBRATION', '', `Total candidates: ${report.totalCandidates}`, `Production eligible: ${report.productionEligible}`, ...Object.entries(dispositions).map(([name, count]) => `${name}: ${count}`), `Composition duplicate warnings: ${compositionDuplicateWarnings.length}`, '', '## Reclassification queue', '', ...reclassificationQueue.map((item) => `- ${item.id}: ${item.currentType} → ${item.proposedType ?? 'Requires PO reclassification'}`), '', '## Coverage gaps', '', '| Type | Approved | Target | Gap |', '| --- | ---: | ---: | ---: |', ...Object.entries(coverageGaps).map(([type, row]) => `| ${type} | ${row.approved} | ${row.target} | ${row.gap} |`), '', 'Targets are aspirational; quality always wins over quantity.', '']
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/curated-core-calibration.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/curated-core-calibration.md'), lines.join('\n'))
console.log(lines.join('\n'))
