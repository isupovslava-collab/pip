import { analyzePresentationIntelligence } from './presentation-intelligence-quality.mjs'

const result = analyzePresentationIntelligence()
if (result.errors.length || result.genericWarnings.length) {
  console.error('PRESENTATION INTELLIGENCE V1 VALIDATION: FAIL')
  for (const error of [...result.errors, ...result.genericWarnings]) console.error(`- ${error}`)
  process.exit(1)
}
console.log('PRESENTATION INTELLIGENCE V1 VALIDATION: PASS')
console.log(`Production approved references: ${result.productionCount}`)
console.log(`Intelligence coverage: ${result.intelligenceCount}`)
console.log(`Missing intelligence: ${result.missing.length}`)
console.log(`Duplicate visual principles: ${result.duplicates.length}`)
console.log(`Generic wording warnings: ${result.genericWarnings.length}`)
console.log(`Brief composer coverage: ${result.briefComposerCoverage}`)
console.log(`Detail page availability: ${result.detailPageAvailable ? 'PASS' : 'FAIL'}`)
