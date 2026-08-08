import { contentTypeIds, goalIds, personaIds, scenarioIds, styleIds } from '../src/types/reference.ts'
import { generateFreshDiscoveryPrompt } from '../src/lib/freshDiscovery/generateFreshDiscoveryPrompt.ts'

const labels = ['Сценарий:', 'Аудитория:', 'Цель:', 'Стиль:', 'Тип слайда:']
const required = ['официальный', 'конкретн', 'Не придумывай', 'свеж']
const errors = []
for (const contentTypeId of contentTypeIds) {
  const prompt = generateFreshDiscoveryPrompt({ scenarioId: scenarioIds[0], personaId: personaIds[0], goalId: goalIds[0], styleId: styleIds[0], contentTypeId })
  for (const label of labels) if (!prompt.includes(label)) errors.push(`${contentTypeId}: missing ${label}`)
  for (const phrase of required) if (!prompt.toLocaleLowerCase('ru').includes(phrase.toLocaleLowerCase('ru'))) errors.push(`${contentTypeId}: missing requirement ${phrase}`)
  if (/undefined|null/.test(prompt)) errors.push(`${contentTypeId}: unresolved value in prompt`)
}

if (errors.length) {
  console.error('FRESH DISCOVERY PROMPT VALIDATION: FAIL')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log('FRESH DISCOVERY PROMPT VALIDATION: PASS')
console.log(`Content-specific prompt variants: ${contentTypeIds.length}`)
console.log(`Human-readable query labels: ${labels.length}`)
