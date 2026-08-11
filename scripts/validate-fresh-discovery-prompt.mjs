import { contentTypeIds, goalIds, personaIds, scenarioIds, styleIds } from '../src/types/reference.ts'
import { FRESH_DISCOVERY_PROMPT_VERSION, freshDiscoveryGuidance, generateFreshDiscoveryPrompt, generateFreshDiscoveryPromptV2 } from '../src/lib/freshDiscovery/generateFreshDiscoveryPrompt.ts'

const required = ['PIP Fresh Discovery v3', 'HARD EXACT-TYPE GATE', 'SOURCE DIVERSITY', 'COMPOSITION DIVERSITY', 'LINK RELIABILITY', 'ABSTRACT FALLBACK PREVENTION', 'SCREEN SUITABILITY', 'без фиксированной квоты', 'не придумывай URL', 'прямую проверенную ссылку', 'статус проверки ссылки']
const errors = []
if (FRESH_DISCOVERY_PROMPT_VERSION !== 'v3') errors.push('production prompt version must be v3')
for (const contentTypeId of contentTypeIds) {
  const query = { scenarioId: scenarioIds[0], personaId: personaIds[0], goalId: goalIds[0], styleId: styleIds[0], contentTypeId }
  const prompt = generateFreshDiscoveryPrompt(query)
  for (const phrase of required) if (!prompt.toLocaleLowerCase('ru').includes(phrase.toLocaleLowerCase('ru'))) errors.push(`${contentTypeId}: missing ${phrase}`)
  for (const guidance of freshDiscoveryGuidance[contentTypeId]) if (!prompt.includes(guidance)) errors.push(`${contentTypeId}: missing content guidance ${guidance}`)
  if (/найди\s+(до\s+)?\d+|ровно\s+\d+/i.test(prompt)) errors.push(`${contentTypeId}: fixed quota detected`)
  if (/undefined|null/.test(prompt)) errors.push(`${contentTypeId}: unresolved value`)
  if (!generateFreshDiscoveryPromptV2(query).includes('Exact References')) errors.push(`${contentTypeId}: v2 history not preserved`)
}
if (errors.length) { console.error('FRESH DISCOVERY PROMPT V3 VALIDATION: FAIL'); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1) }
console.log('FRESH DISCOVERY PROMPT V3 VALIDATION: PASS')
console.log(`Prompt version: ${FRESH_DISCOVERY_PROMPT_VERSION}`)
console.log(`Content-specific variants: ${contentTypeIds.length}`)
console.log('Exact gate, source/link diversity, composition diversity and abstract fallback prevention: PASS')
console.log('Historical v2 generator: PRESERVED')
