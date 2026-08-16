import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverageMinimums, taxonomy, themes } from './library-config.mjs'
import { previewModes, rightsStatuses } from './source-records.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const rootDirectory = path.resolve(scriptDirectory, '..')
const dataPath = path.join(rootDirectory, 'public', 'data', 'references.json')
const previewDirectory = path.join(rootDirectory, 'public', 'previews')
const coveragePath = path.join(rootDirectory, 'docs', 'library-coverage.md')
const mode = process.argv[2] ?? 'validate'
const references = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

const fields = {
  scenarios: 'scenarioIds', personas: 'personaIds', goals: 'goalIds', styles: 'styleIds', contentTypes: 'contentTypeIds',
}

function countBy(field, values) {
  return Object.fromEntries(values.map((value) => [value, references.filter((reference) => reference[field].includes(value)).length]))
}

function coverage() {
  return Object.fromEntries(Object.entries(fields).map(([dimension, field]) => [dimension, countBy(field, taxonomy[dimension])]))
}

function validateData() {
  const errors = []
  if (references.length !== 100) errors.push(`Expected 100 references, received ${references.length}.`)
  const expectedIds = Array.from({ length: 100 }, (_, index) => `REF-${String(index + 1).padStart(6, '0')}`)
  const actualIds = references.map(({ id }) => id)
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) errors.push('Reference IDs must be continuous and ordered from REF-000001 to REF-000100.')
  if (new Set(actualIds).size !== actualIds.length) errors.push('Reference IDs must be unique.')

  const requiredStrings = ['id', 'title', 'summary', 'previewPath', 'category', 'sourceType', 'sourceLabel', 'previewMode', 'qualityTier', 'primaryContentTypeId', 'visualReferenceQuality', 'curatedCoreStatus', 'contentTypePoVerificationStatus', 'poReviewDisposition', 'compositionFamily', 'visualDirection']
  const requiredFields = ['id', 'title', 'summary', 'sourceType', 'sourceLabel', 'sourceUrl', 'sourceBacked', 'sourceTitle', 'sourceOrganization', 'rightsStatus', 'sourceNotes', 'sourceAccessCheckedAt', 'previewMode', 'qualityTier', 'primaryContentTypeId', 'screenSuitable', 'visualReferenceQuality', 'curatedCoreStatus', 'contentTypePoVerificationStatus', 'poReviewDisposition', 'productionApproved', 'heroScenarioId', 'compositionFamily', 'visualDirection', 'referenceSchemaVersion', 'previewPath', 'scenarioIds', 'personaIds', 'goalIds', 'styleIds', 'contentTypeIds', 'category', 'tags', 'useWhen', 'avoidWhen', 'designDna']
  const allowedFields = new Set([...requiredFields, 'contentTypePoVerifiedAt', 'contentTypePoVerifiedBy', 'contentTypePoNotes', 'proposedPrimaryContentType', 'poReviewNotes', 'poReviewRound', 'poReviewedAt', 'poReviewedBy'])
  const arrayRules = {
    scenarioIds: [taxonomy.scenarios, 1, Number.POSITIVE_INFINITY],
    personaIds: [taxonomy.personas, 1, Number.POSITIVE_INFINITY],
    goalIds: [taxonomy.goals, 1, Number.POSITIVE_INFINITY],
    styleIds: [taxonomy.styles, 1, Number.POSITIVE_INFINITY],
    contentTypeIds: [taxonomy.contentTypes, 1, Number.POSITIVE_INFINITY],
    tags: [null, 3, 6], useWhen: [null, 2, 4], avoidWhen: [null, 1, 3],
  }
  const designKeys = ['minimalism', 'corporate', 'executive', 'modern', 'whitespace', 'dataDensity', 'formality', 'visualComplexity']

  references.forEach((reference, index) => {
    const prefix = reference.id || `item ${index + 1}`
    for (const field of requiredFields) if (!(field in reference)) errors.push(`${prefix}: missing required field ${field}.`)
    for (const field of Object.keys(reference)) if (!allowedFields.has(field)) errors.push(`${prefix}: unknown field ${field}.`)
    requiredStrings.forEach((field) => {
      if (typeof reference[field] !== 'string' || reference[field].trim() === '') errors.push(`${prefix}: ${field} must be a non-empty string.`)
    })
    if (typeof reference.sourceBacked !== 'boolean') errors.push(`${prefix}: sourceBacked must be boolean.`)
    if (reference.productionApproved !== true) errors.push(`${prefix}: production library records must be approved.`)
    if (reference.referenceSchemaVersion !== 2) errors.push(`${prefix}: referenceSchemaVersion must be 2.`)
    if (!previewModes.includes(reference.previewMode)) errors.push(`${prefix}: invalid previewMode.`)
    if (!['hero', 'gold', 'standard', 'prototype'].includes(reference.qualityTier)) errors.push(`${prefix}: invalid qualityTier.`)
    if (!taxonomy.contentTypes.includes(reference.primaryContentTypeId)) errors.push(`${prefix}: invalid primaryContentTypeId.`)
    if (!reference.contentTypeIds.includes(reference.primaryContentTypeId)) errors.push(`${prefix}: primaryContentTypeId must be present in contentTypeIds.`)
    if (typeof reference.screenSuitable !== 'boolean') errors.push(`${prefix}: screenSuitable must be boolean.`)
    if (!['premium', 'good', 'schematic', 'prototype', 'unknown'].includes(reference.visualReferenceQuality)) errors.push(`${prefix}: invalid visualReferenceQuality.`)
    if (!['eligible', 'review_only', 'excluded'].includes(reference.curatedCoreStatus)) errors.push(`${prefix}: invalid curatedCoreStatus.`)
    if (!['verified', 'reclassify', 'rejected', 'pending'].includes(reference.contentTypePoVerificationStatus)) errors.push(`${prefix}: invalid contentTypePoVerificationStatus.`)
    if (reference.contentTypePoVerificationStatus === 'verified' && (reference.contentTypePoVerifiedBy !== 'product_owner' || !/^\d{4}-\d{2}-\d{2}$/.test(reference.contentTypePoVerifiedAt ?? ''))) errors.push(`${prefix}: verified content type requires Product Owner and date.`)
    if (reference.contentTypePoVerificationStatus === 'reclassify' && reference.proposedPrimaryContentType !== undefined && (!taxonomy.contentTypes.includes(reference.proposedPrimaryContentType) || reference.proposedPrimaryContentType === reference.primaryContentTypeId)) errors.push(`${prefix}: proposedPrimaryContentType must be a different valid type.`)
    if ((reference.contentTypePoNotes?.length ?? 0) > 1000) errors.push(`${prefix}: contentTypePoNotes exceeds 1000 characters.`)
    if (!['approved', 'reclassify', 'revise_visual', 'rejected_schematic', 'rejected_wrong_type', 'rejected_quality', 'pending'].includes(reference.poReviewDisposition)) errors.push(`${prefix}: invalid poReviewDisposition.`)
    if ((reference.poReviewNotes?.length ?? 0) > 1000) errors.push(`${prefix}: poReviewNotes exceeds 1000 characters.`)
    if (reference.poReviewDisposition !== 'pending' && (reference.poReviewRound !== 'sprint-9-1-manual' || reference.poReviewedBy !== 'product_owner' || !/^\d{4}-\d{2}-\d{2}$/.test(reference.poReviewedAt ?? ''))) errors.push(`${prefix}: decided PO review requires round, Product Owner and date.`)
    if (reference.poReviewDisposition === 'approved' && (reference.contentTypePoVerificationStatus !== 'verified' || reference.visualReferenceQuality !== 'premium' || reference.curatedCoreStatus !== 'eligible')) errors.push(`${prefix}: PO-approved reference must be type verified, premium and eligible.`)
    if (reference.poReviewDisposition !== 'approved' && reference.curatedCoreStatus === 'eligible') errors.push(`${prefix}: non-approved reference cannot be eligible.`)
    if (!new RegExp(`^previews/${reference.id}\\.(svg|png|webp)$`).test(reference.previewPath)) errors.push(`${prefix}: previewPath does not match its ID.`)
    if (reference.sourceBacked) {
      for (const field of ['sourceTitle', 'sourceOrganization', 'sourceUrl', 'rightsStatus', 'sourceNotes', 'sourceAccessCheckedAt']) {
        if (typeof reference[field] !== 'string' || reference[field].trim() === '') errors.push(`${prefix}: ${field} is required for a source-backed reference.`)
      }
      if (!rightsStatuses.includes(reference.rightsStatus)) errors.push(`${prefix}: invalid rightsStatus.`)
      if (!/^https:\/\//.test(reference.sourceUrl ?? '')) errors.push(`${prefix}: sourceUrl must be HTTPS.`)
      if (!['hero', 'gold'].includes(reference.qualityTier)) errors.push(`${prefix}: source-backed reference must use the hero or gold tier.`)
      if (reference.previewMode !== 'original_pip_interpretation') errors.push(`${prefix}: unlicensed source must use an original PIP interpretation.`)
    } else {
      if (reference.sourceType !== 'synthetic') errors.push(`${prefix}: standard sourceType must be synthetic.`)
      if (reference.sourceUrl !== null || reference.sourceTitle !== null || reference.sourceOrganization !== null || reference.rightsStatus !== null || reference.sourceNotes !== null || reference.sourceAccessCheckedAt !== null) errors.push(`${prefix}: standard source metadata must be null.`)
      if (!['standard', 'prototype'].includes(reference.qualityTier)) errors.push(`${prefix}: non-source-backed reference must use the standard or prototype tier.`)
    }

    Object.entries(arrayRules).forEach(([field, [allowed, minimum, maximum]]) => {
      const values = reference[field]
      if (!Array.isArray(values) || values.length < minimum || values.length > maximum) {
        errors.push(`${prefix}: ${field} must contain ${minimum}–${maximum === Number.POSITIVE_INFINITY ? '∞' : maximum} values.`)
        return
      }
      if (new Set(values).size !== values.length) errors.push(`${prefix}: ${field} contains duplicates.`)
      if (allowed) values.forEach((value) => {
        if (!allowed.includes(value)) errors.push(`${prefix}: ${field} contains unknown value ${value}.`)
      })
    })

    if (!reference.designDna || Object.keys(reference.designDna).length !== designKeys.length) errors.push(`${prefix}: designDna must contain exactly eight fields.`)
    designKeys.forEach((key) => {
      const value = reference.designDna?.[key]
      if (!Number.isInteger(value) || value < 0 || value > 100) errors.push(`${prefix}: designDna.${key} must be an integer from 0 to 100.`)
    })

    const previewPath = path.join(rootDirectory, 'public', reference.previewPath)
    if (!fs.existsSync(previewPath)) {
      errors.push(`${prefix}: preview file is missing.`)
    } else {
      if (reference.previewPath.endsWith('.svg')) {
        const svg = fs.readFileSync(previewPath, 'utf8')
        if (!svg.includes('viewBox="0 0 1600 900"')) errors.push(`${prefix}: SVG preview must use viewBox 0 0 1600 900.`)
        if (/<image\b/i.test(svg) || /(?:href|src)=["']https?:/i.test(svg)) errors.push(`${prefix}: preview contains an external or raster resource.`)
      }
    }
  })

  const previewFiles = fs.readdirSync(previewDirectory).filter((name) => /^REF-\d{6}\.(svg|png|webp)$/.test(name)).sort()
  const expectedFiles = references.map(({ previewPath }) => path.basename(previewPath)).sort()
  if (JSON.stringify(previewFiles) !== JSON.stringify(expectedFiles)) errors.push('public/previews must contain exactly the 100 files declared in metadata.')
  const sourceBacked = references.filter((reference) => reference.sourceBacked)
  if (sourceBacked.length !== 24) errors.push(`Expected 24 source-backed references, received ${sourceBacked.length}.`)
  const heroes = references.filter((reference) => reference.qualityTier === 'hero')
  if (heroes.length !== 6) errors.push(`Expected 6 production Hero references, received ${heroes.length}.`)
  if (new Set(heroes.map(({ heroScenarioId }) => heroScenarioId)).size !== 6) errors.push('Production Hero references must map to six unique scenarios.')
  uniqueThemeCategories().forEach((category) => {
    const count = references.filter((reference) => reference.category === category).length
    if (count < 2) errors.push(`The thematic group “${category}” must contain at least two references.`)
  })
  return errors
}

function uniqueThemeCategories() {
  return [...new Set(themes.map(({ category }) => category))]
}

function duplicateErrors() {
  const errors = []
  const checks = [
    ['title', (reference) => reference.title.trim().toLocaleLowerCase('ru')],
    ['summary', (reference) => reference.summary.trim().toLocaleLowerCase('ru')],
    ['metadata', (reference) => ['scenarioIds', 'personaIds', 'goalIds', 'styleIds', 'contentTypeIds'].map((field) => [...reference[field]].sort().join(',')).join('|')],
  ]
  checks.forEach(([label, valueFor]) => {
    const seen = new Map()
    references.forEach((reference) => {
      const value = valueFor(reference)
      if (seen.has(value)) errors.push(`Duplicate ${label}: ${seen.get(value)} and ${reference.id}.`)
      else seen.set(value, reference.id)
    })
  })

  const hashes = new Map()
  references.forEach((reference) => {
    const svgPath = path.join(rootDirectory, 'public', reference.previewPath)
    if (!fs.existsSync(svgPath)) return
    const hash = crypto.createHash('sha256').update(fs.readFileSync(svgPath)).digest('hex')
    if (hashes.has(hash)) errors.push(`Duplicate SVG content: ${hashes.get(hash)} and ${reference.id}.`)
    else hashes.set(hash, reference.id)
  })
  return errors
}

function coverageErrors(result) {
  const errors = []
  Object.entries(coverageMinimums).forEach(([dimension, minimums]) => {
    Object.entries(minimums).forEach(([value, minimum]) => {
      if (result[dimension][value] < minimum) errors.push(`${dimension}.${value}: ${result[dimension][value]} is below ${minimum}.`)
    })
  })
  return errors
}

function writeCoverageReport(result) {
  const headings = { scenarios: 'Сценарии', personas: 'Аудитории', goals: 'Цели', styles: 'Стили', contentTypes: 'Типы контента' }
  const sections = Object.entries(result).map(([dimension, counts]) => {
    const rows = Object.entries(counts).map(([value, count]) => {
      const minimum = coverageMinimums[dimension][value]
      const status = count >= minimum ? 'PASS' : 'FAIL'
      return `| \`${value}\` | ${count} | ${minimum} | ${status} |`
    }).join('\n')
    const status = Object.entries(counts).every(([value, count]) => count >= coverageMinimums[dimension][value]) ? 'PASS' : 'FAIL'
    return `## ${headings[dimension]} — ${status}\n\n| ID | Референсов | Минимум | Статус |\n|---|---:|---:|:---:|\n${rows}`
  }).join('\n\n')
  const content = `# Покрытие библиотеки PIP\n\nОтчёт создан командой \`npm run report:coverage\`. Библиотека: **${references.length} референсов**.\n\n${sections}\n`
  fs.mkdirSync(path.dirname(coveragePath), { recursive: true })
  fs.writeFileSync(coveragePath, content, 'utf8')
}

let errors = []
if (mode === 'validate') errors = validateData()
else if (mode === 'duplicates') errors = duplicateErrors()
else if (mode === 'coverage') {
  const result = coverage()
  writeCoverageReport(result)
  errors = coverageErrors(result)
} else errors = [`Unknown mode: ${mode}.`]

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`${mode}: PASS (${references.length} references).`)
}
