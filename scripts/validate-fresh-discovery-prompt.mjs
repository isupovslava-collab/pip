import { contentTypeIds, goalIds, personaIds, scenarioIds, styleIds } from '../src/types/reference.ts'
import { FRESH_DISCOVERY_PROMPT_VERSION, freshDiscoveryGuidance, generateFreshDiscoveryPrompt } from '../src/lib/freshDiscovery/generateFreshDiscoveryPrompt.ts'

const labels = ['Сценарий:', 'Аудитория:', 'Цель:', 'Стиль:', 'Тип слайда:']
const required = [
  'до 8', 'визуально проверь сам конкретный слайд', 'Screen Suitability', 'Design Freshness',
  'Annual report', 'журнальный разворот', 'wireframes', 'Exact References', 'Creative Alternatives',
  'не придумывай URL', 'не придумывай номер страницы', 'не придумывай название или содержание слайда',
  'покажи preview', 'Не добавляй слабые примеры ради количества',
]
const errors = []
if (FRESH_DISCOVERY_PROMPT_VERSION !== 'v2') errors.push('prompt version must be v2')
for (const contentTypeId of contentTypeIds) {
  const prompt = generateFreshDiscoveryPrompt({ scenarioId: scenarioIds[0], personaId: personaIds[0], goalId: goalIds[0], styleId: styleIds[0], contentTypeId })
  for (const label of labels) if (!prompt.includes(label)) errors.push(`${contentTypeId}: missing ${label}`)
  for (const phrase of required) if (!prompt.toLocaleLowerCase('ru').includes(phrase.toLocaleLowerCase('ru'))) errors.push(`${contentTypeId}: missing requirement ${phrase}`)
  for (const guidance of freshDiscoveryGuidance[contentTypeId]) if (!prompt.includes(guidance)) errors.push(`${contentTypeId}: missing content guidance ${guidance}`)
  if (prompt.indexOf('Exact References') > prompt.indexOf('Creative Alternatives')) errors.push(`${contentTypeId}: Creative Alternatives appear before Exact References`)
  if (/6[–-]10|найди\s+8\s/i.test(prompt)) errors.push(`${contentTypeId}: prompt contains a quota-filling instruction`)
  if (/undefined|null/.test(prompt)) errors.push(`${contentTypeId}: unresolved value in prompt`)
}

if (errors.length) {
  console.error('FRESH DISCOVERY PROMPT V2 VALIDATION: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log('FRESH DISCOVERY PROMPT V2 VALIDATION: PASS')
console.log(`Prompt version: ${FRESH_DISCOVERY_PROMPT_VERSION}`)
console.log(`Content-specific prompt variants: ${contentTypeIds.length}`)
console.log(`Human-readable query labels: ${labels.length}`)
console.log('Exact / Creative split: PASS')
console.log('Visual inspection, screen suitability, freshness and no-quota gates: PASS')
