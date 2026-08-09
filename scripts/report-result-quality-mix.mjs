import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const [{ rankReferences }, { controlQueries }, { contentPrecisionQueries }] = await Promise.all([
  vite.ssrLoadModule('/src/services/rankReferences.ts'),
  vite.ssrLoadModule('/src/data/controlQueries.ts'),
  vite.ssrLoadModule('/src/data/contentPrecisionQueries.ts'),
])
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const queries = [...controlQueries, ...contentPrecisionQueries]
const tiers = ['hero', 'gold', 'standard', 'prototype']
const totals = Object.fromEntries(tiers.map((tier) => [tier, 0]))
const byContentType = {}
let resultCount = 0
let queriesWithFourPrototypes = 0
for (const query of queries) {
  const results = rankReferences(references, query).slice(0, 6)
  const counts = Object.fromEntries(tiers.map((tier) => [tier, results.filter((item) => item.qualityTier === tier).length]))
  for (const tier of tiers) totals[tier] += counts[tier]
  resultCount += results.length
  if (counts.prototype >= 4) queriesWithFourPrototypes += 1
  const content = byContentType[query.contentTypeId] ?? { queries: 0, results: 0, hero: 0, gold: 0, standard: 0, prototype: 0 }
  content.queries += 1
  content.results += results.length
  for (const tier of tiers) content[tier] += counts[tier]
  byContentType[query.contentTypeId] = content
}
await vite.close()
const result = { queries: queries.length, resultCount, totals, byContentType, queriesWithFourPrototypes }
const round = (value) => Math.round(value * 100) / 100
const enrichedByContentType = Object.fromEntries(Object.entries(result.byContentType).map(([type, values]) => [type, {
  ...values,
  prototypeExposureRate: values.results ? round(values.prototype / values.results) : 0,
  heroGoldShare: values.results ? round((values.hero + values.gold) / values.results) : 0,
}]))
const report = {
  report: 'RESULT QUALITY MIX',
  querySources: ['controlQueries', 'contentPrecisionQueries'],
  queriesTested: result.queries,
  topResultsTested: result.resultCount,
  averageTop6: Object.fromEntries(Object.entries(result.totals).map(([tier, count]) => [tier, round(count / result.queries)])),
  totals: result.totals,
  prototypeExposureRate: result.resultCount ? round(result.totals.prototype / result.resultCount) : 0,
  heroGoldShare: result.resultCount ? round((result.totals.hero + result.totals.gold) / result.resultCount) : 0,
  queriesWithAtLeastFourPrototypeResults: result.queriesWithFourPrototypes,
  byContentType: enrichedByContentType,
  limitation: 'qualityTier is a maintained metadata taxonomy, not an automated visual-quality judgment; it may not capture every schematic characteristic.',
}

const pct = (value) => `${round(value * 100)}%`
const lines = [
  '# RESULT QUALITY MIX', '',
  `Queries tested: ${report.queriesTested}`, '',
  '## Average Top 6', '',
  `- Hero: ${report.averageTop6.hero}`,
  `- Gold: ${report.averageTop6.gold}`,
  `- Standard: ${report.averageTop6.standard}`,
  `- Prototype: ${report.averageTop6.prototype}`, '',
  `Prototype Exposure Rate: ${pct(report.prototypeExposureRate)}`,
  `Hero + Gold Share: ${pct(report.heroGoldShare)}`,
  `Queries with >=4 prototype/schematic results: ${report.queriesWithAtLeastFourPrototypeResults}`, '',
  '## By content type', '',
  '| Content type | Queries | Hero | Gold | Standard | Prototype | Prototype exposure | Hero + Gold share |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...Object.entries(report.byContentType).sort(([a], [b]) => a.localeCompare(b)).map(([type, values]) => `| ${type} | ${values.queries} | ${values.hero} | ${values.gold} | ${values.standard} | ${values.prototype} | ${pct(values.prototypeExposureRate)} | ${pct(values.heroGoldShare)} |`),
  '', '## Limitation', '', report.limitation, '',
  'This is a report-only measurement. It does not modify reference data, ranking weights, or selection logic.',
]

await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/result-quality-mix.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/result-quality-mix.md'), `${lines.join('\n')}\n`)
console.log(lines.slice(0, 15).join('\n'))
