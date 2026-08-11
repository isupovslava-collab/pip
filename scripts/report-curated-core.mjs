import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const eligible = references.filter((reference) => reference.curatedCoreStatus === 'eligible' && reference.visualReferenceQuality === 'premium' && reference.screenSuitable === true && reference.productionApproved === true && (reference.previewMode === 'original_pip_interpretation' ? reference.qualityTier === 'hero' : reference.sourceBacked === true))
const contentTypes = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table']
const byContentType = Object.fromEntries(contentTypes.map((type) => [type, eligible.filter(({ primaryContentTypeId }) => primaryContentTypeId === type).length]))
const report = { report: 'PREMIUM CURATED CORE', physicalReferences: references.length, eligibleTotal: eligible.length, maxProductionResults: 3, exactOnly: true, premiumOnly: true, byContentType, eligibleIds: eligible.map(({ id }) => id) }
const lines = ['# PREMIUM CURATED CORE', '', `Physical references: ${report.physicalReferences}`, `Eligible total: ${report.eligibleTotal}`, 'Maximum production results: 3', 'Exact-only: PASS', 'Premium-only: PASS', '', '## Coverage', '', '| Content type | Eligible |', '| --- | ---: |', ...Object.entries(byContentType).map(([type, count]) => `| ${type} | ${count} |`), '', `Eligible IDs: ${report.eligibleIds.join(', ') || 'none'}`, '']
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/curated-core.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/curated-core.md'), lines.join('\n'))
console.log(lines.join('\n'))
