import fs from 'node:fs'
import { referenceIntelligence } from '../src/data/sourceReferences/reference-intelligence.ts'
import { sourceReferences } from '../src/data/sourceReferences/source-references.ts'

const references = JSON.parse(fs.readFileSync(new URL('../public/data/references.json', import.meta.url), 'utf8'))
const referenceIds = new Set(references.map(({ id }) => id))
const sourceIds = new Set(sourceReferences.map(({ id }) => id))
const errors = []
const generic = /^(хорошая визуальная иерархия|понятная композиция|красивый дизайн)[.!]?$/i

for (const item of referenceIntelligence) {
  if (!referenceIds.has(item.referenceId)) errors.push(`${item.referenceId}: phantom reference ID.`)
  if (item.whyItWorks.length < 3) errors.push(`${item.referenceId}: minimum 3 whyItWorks items required.`)
  if (item.dataMappingGuide.length < 2) errors.push(`${item.referenceId}: minimum 2 dataMappingGuide items required.`)
  if (!item.doNotCopy.length) errors.push(`${item.referenceId}: doNotCopy guidance is required.`)
  const strings = [item.compositionPrinciple, ...item.whyItWorks.flatMap(({ title, explanation }) => [title, explanation]), ...item.dataMappingGuide.flatMap(({ placement, guidance }) => [placement, guidance]), ...item.doNotCopy]
  if (strings.some((value) => !value.trim() || generic.test(value.trim()))) errors.push(`${item.referenceId}: empty or generic intelligence string.`)
  for (const sourceId of item.sourceReferenceIds ?? []) if (!sourceIds.has(sourceId)) errors.push(`${item.referenceId}: phantom source reference ${sourceId}.`)
}

const productionHeroes = references.filter(({ qualityTier, productionApproved }) => qualityTier === 'hero' && productionApproved)
for (const hero of productionHeroes) if (!referenceIntelligence.some(({ referenceId }) => referenceId === hero.id)) errors.push(`${hero.id}: production Hero is missing Intelligence.`)
if (referenceIntelligence.some(({ referenceId }) => ['HERO-MEETING-001', 'HERO-STRATEGY-001'].includes(referenceId))) errors.push('Review-only Meeting/Strategy Hero must not be promoted through Intelligence data.')

if (errors.length) {
  console.error('REFERENCE INTELLIGENCE VALIDATION: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log('REFERENCE INTELLIGENCE VALIDATION: PASS')
console.log(`Slide Anatomy: ${referenceIntelligence.length}`)
console.log(`Data Mapping: ${referenceIntelligence.filter(({ dataMappingGuide }) => dataMappingGuide.length >= 2).length}`)
