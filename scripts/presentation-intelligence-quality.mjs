import fs from 'node:fs'
import { presentationIntelligenceV1 } from '../src/data/referenceIntelligence/index.ts'
import { composeDesignBrief } from '../src/services/composeDesignBrief.ts'

const root = new URL('../', import.meta.url)
const references = JSON.parse(fs.readFileSync(new URL('public/data/references.json', root), 'utf8'))
const production = references.filter(({ curatedCoreStatus, visualReferenceQuality, contentTypePoVerificationStatus, poReviewDisposition, screenSuitable, productionApproved }) => curatedCoreStatus === 'eligible' && visualReferenceQuality === 'premium' && contentTypePoVerificationStatus === 'verified' && poReviewDisposition === 'approved' && screenSuitable && productionApproved)
const genericPatterns = [/хорошая визуальная иерархия/i, /понятная композиция/i, /красивый дизайн/i, /используйте крупный заголовок/i, /соблюдайте визуальную иерархию/i]
const contentTypes = ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table']

export function analyzePresentationIntelligence() {
  const errors = []
  const ids = new Set(references.map(({ id }) => id))
  const productionIds = new Set(production.map(({ id }) => id))
  const intelligenceIds = new Set(presentationIntelligenceV1.map(({ referenceId }) => referenceId))
  const principles = presentationIntelligenceV1.map(({ visualPrinciple }) => visualPrinciple.trim().toLocaleLowerCase('ru'))
  const duplicates = [...new Set(principles.filter((value, index) => principles.indexOf(value) !== index))]
  const genericWarnings = []
  const titleCounts = new Map()

  if (production.length !== 20) errors.push(`Production approved references must equal 20, received ${production.length}.`)
  if (presentationIntelligenceV1.length !== 20) errors.push(`Intelligence records must equal 20, received ${presentationIntelligenceV1.length}.`)
  if (intelligenceIds.size !== presentationIntelligenceV1.length) errors.push('Intelligence reference IDs must be unique.')
  for (const reference of production) if (!intelligenceIds.has(reference.id)) errors.push(`${reference.id}: production reference is missing Intelligence.`)

  for (const item of presentationIntelligenceV1) {
    const reference = references.find(({ id }) => id === item.referenceId)
    if (!ids.has(item.referenceId)) errors.push(`${item.referenceId}: unknown reference ID.`)
    if (!productionIds.has(item.referenceId)) errors.push(`${item.referenceId}: Intelligence is allowed only for production-approved references.`)
    if (reference && item.contentTypeId !== reference.primaryContentTypeId) errors.push(`${item.referenceId}: Intelligence content type mismatch.`)
    if (item.schemaVersion !== 1) errors.push(`${item.referenceId}: schemaVersion must be 1.`)
    if (item.visualPrinciple.trim().length < 40) errors.push(`${item.referenceId}: visualPrinciple is too short.`)
    if (item.whyItWorks.length < 3 || item.whyItWorks.length > 5) errors.push(`${item.referenceId}: whyItWorks must contain 3–5 items.`)
    if (item.anatomy.length < 3) errors.push(`${item.referenceId}: anatomy requires at least 3 items.`)
    if (!item.hierarchy.primary.trim() || !item.hierarchy.secondary.trim() || !item.hierarchy.supporting.length) errors.push(`${item.referenceId}: hierarchy is incomplete.`)
    if (item.contentMapping.length < 2 || item.contentMapping.some(({ slot, currentRole, replaceWith }) => !slot.trim() || !currentRole.trim() || !replaceWith.trim())) errors.push(`${item.referenceId}: contentMapping is invalid.`)
    for (const field of ['preserve', 'replace', 'avoid']) if (item.adaptation[field].length < 2) errors.push(`${item.referenceId}: adaptation.${field} requires at least 2 items.`)
    if (item.bestFor.length < 2) errors.push(`${item.referenceId}: bestFor requires at least 2 items.`)
    const brief = item.designBrief
    if (![brief.layout, brief.emphasis, brief.visualMood, brief.contentLogic].every((value) => value.trim().length >= 20) || brief.constraints.length < 2) errors.push(`${item.referenceId}: designBrief is incomplete.`)
    const allText = [item.visualPrinciple, ...item.whyItWorks.flatMap(({ title, explanation }) => [title, explanation]), ...item.anatomy.flatMap(({ label, purpose }) => [label, purpose]), ...item.contentMapping.flatMap(({ slot, currentRole, replaceWith }) => [slot, currentRole, replaceWith]), ...item.adaptation.preserve, ...item.adaptation.replace, ...item.adaptation.avoid]
    if (allText.some((value) => !value.trim())) errors.push(`${item.referenceId}: empty Intelligence string.`)
    if (allText.some((value) => genericPatterns.some((pattern) => pattern.test(value)))) genericWarnings.push(`${item.referenceId}: generic wording.`)
    for (const { title } of item.whyItWorks) titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1)
    if (reference) {
      const composed = composeDesignBrief(reference, item, { scenarioId: 'report', personaId: 'board', goalId: 'explain_results', styleId: 'executive', contentTypeId: item.contentTypeId })
      if (!['Сценарий: Отчёт', 'Аудитория: Правление', 'Цель: Объяснить результаты', 'Стиль: Строгий управленческий', item.visualPrinciple, 'СОХРАНИТЬ', 'ЗАМЕНИТЬ СВОИМИ ДАННЫМИ', 'ИЗБЕГАТЬ', 'Не копируйте конкретные данные'].every((fragment) => composed.includes(fragment))) errors.push(`${item.referenceId}: context-aware brief composer is incomplete.`)
    }
  }
  for (const [title, count] of titleCounts) if (count > 2) genericWarnings.push(`Repeated whyItWorks title (${count}): ${title}`)
  if (duplicates.length) errors.push(`Duplicate visual principles: ${duplicates.join(' | ')}`)

  const coverageByType = Object.fromEntries(contentTypes.map((contentType) => [contentType, presentationIntelligenceV1.filter(({ contentTypeId }) => contentTypeId === contentType).length]))
  const missing = production.filter(({ id }) => !intelligenceIds.has(id)).map(({ id }) => id)
  const referencePage = fs.readFileSync(new URL('src/pages/ReferencePage.tsx', root), 'utf8')
  const detailPageAvailable = referencePage.includes('presentationIntelligenceById') && referencePage.includes('ReferenceIntelligencePanel')
  if (!detailPageAvailable) errors.push('Reference Detail page is not connected to Presentation Intelligence V1.')

  return { productionCount: production.length, intelligenceCount: presentationIntelligenceV1.length, coverageByType, missing, duplicates, genericWarnings, briefComposerCoverage: production.length - missing.length, detailPageAvailable, errors }
}
