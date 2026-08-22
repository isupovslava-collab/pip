import fs from 'node:fs'
import { analyzePresentationIntelligence } from './presentation-intelligence-quality.mjs'

const result = analyzePresentationIntelligence()
const json = { generatedAt: new Date().toISOString(), ...result, status: result.errors.length || result.genericWarnings.length ? 'FAIL' : 'PASS' }
const lines = ['# PRESENTATION INTELLIGENCE V1', '', `Status: ${json.status}`, `Production approved references: ${result.productionCount}`, `Intelligence coverage: ${result.intelligenceCount}`, `Missing intelligence: ${result.missing.length ? result.missing.join(', ') : 'none'}`, `Duplicate visual principles: ${result.duplicates.length}`, `Generic wording warnings: ${result.genericWarnings.length}`, `Brief composer coverage: ${result.briefComposerCoverage}`, `Detail page availability: ${result.detailPageAvailable ? 'PASS' : 'FAIL'}`, '', '## Coverage by content type', '', '| Type | Intelligence |', '| --- | ---: |', ...Object.entries(result.coverageByType).map(([type, count]) => `| ${type} | ${count} |`), '']
fs.writeFileSync(new URL('../reports/presentation-intelligence.json', import.meta.url), `${JSON.stringify(json, null, 2)}\n`)
fs.writeFileSync(new URL('../reports/presentation-intelligence.md', import.meta.url), `${lines.join('\n')}\n`)
console.log(lines.join('\n'))
if (json.status === 'FAIL') process.exit(1)
