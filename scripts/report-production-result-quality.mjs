import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const [{ selectCuratedCore }, { controlQueries }] = await Promise.all([vite.ssrLoadModule('/src/services/selectCuratedCore.ts'), vite.ssrLoadModule('/src/data/controlQueries.ts')])
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const rows = controlQueries.map((query) => ({ queryId: query.id, contentTypeId: query.contentTypeId, results: selectCuratedCore(references, query) }))
await vite.close()
const distribution = Object.fromEntries([0, 1, 2, 3].map((count) => [count, rows.filter(({ results }) => results.length === count).length]))
const allResults = rows.flatMap(({ results }) => results)
const count = (predicate) => allResults.filter(predicate).length
const wrongTypeExposure = rows.reduce((total, row) => total + row.results.filter(({ primaryContentTypeId }) => primaryContentTypeId !== row.contentTypeId).length, 0)
const nonPremiumExposure = count(({ visualReferenceQuality }) => visualReferenceQuality !== 'premium')
const nonApprovedExposure = count(({ poReviewDisposition }) => poReviewDisposition !== 'approved')
const rejectedSchematicExposure = count(({ poReviewDisposition }) => poReviewDisposition === 'rejected_schematic')
const reclassifyExposure = count(({ poReviewDisposition }) => poReviewDisposition === 'reclassify')
const reviseExposure = count(({ poReviewDisposition }) => poReviewDisposition === 'revise_visual')
const report = { report: 'PRODUCTION RESULT QUALITY', queriesTested: rows.length, distribution, averageResults: Math.round(allResults.length / rows.length * 100) / 100, maxObserved: Math.max(...rows.map(({ results }) => results.length)), wrongTypeExposure, nonPremiumExposure, nonApprovedExposure, rejectedSchematicExposure, reclassifyExposure, reviseExposure, byQuery: rows.map(({ queryId, contentTypeId, results }) => ({ queryId, contentTypeId, count: results.length, ids: results.map(({ id }) => id), compositionFamilies: results.map(({ compositionFamily }) => compositionFamily) })) }
const lines = ['# PRODUCTION RESULT QUALITY', '', `Queries tested: ${report.queriesTested}`, `Average results: ${report.averageResults}`, `Maximum observed: ${report.maxObserved}`, `Wrong-type exposure: ${wrongTypeExposure}`, `Non-premium exposure: ${nonPremiumExposure}`, `Non-approved exposure: ${nonApprovedExposure}`, `Rejected schematic exposure: ${rejectedSchematicExposure}`, `Reclassify exposure: ${reclassifyExposure}`, `Revise exposure: ${reviseExposure}`, '', '## Result-count distribution', '', '| Count | Queries |', '| ---: | ---: |', ...Object.entries(distribution).map(([resultCount, queries]) => `| ${resultCount} | ${queries} |`), '']
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/production-result-quality.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/production-result-quality.md'), lines.join('\n'))
console.log(lines.join('\n'))
