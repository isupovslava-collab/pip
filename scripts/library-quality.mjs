import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverageMinimums, taxonomy, themes } from './library-config.mjs'

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

  const requiredStrings = ['id', 'title', 'summary', 'previewPath', 'category', 'sourceType', 'sourceLabel']
  const expectedFields = ['id', 'title', 'summary', 'sourceType', 'sourceLabel', 'sourceUrl', 'previewPath', 'scenarioIds', 'personaIds', 'goalIds', 'styleIds', 'contentTypeIds', 'category', 'tags', 'useWhen', 'avoidWhen', 'designDna'].sort()
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
    if (JSON.stringify(Object.keys(reference).sort()) !== JSON.stringify(expectedFields)) errors.push(`${prefix}: object fields do not match the reference schema.`)
    requiredStrings.forEach((field) => {
      if (typeof reference[field] !== 'string' || reference[field].trim() === '') errors.push(`${prefix}: ${field} must be a non-empty string.`)
    })
    if (reference.sourceType !== 'synthetic') errors.push(`${prefix}: sourceType must be synthetic.`)
    if (reference.sourceLabel !== 'Демонстрационный референс PIP') errors.push(`${prefix}: invalid sourceLabel.`)
    if (reference.sourceUrl !== null) errors.push(`${prefix}: sourceUrl must be null.`)
    if (reference.previewPath !== `previews/${reference.id}.svg`) errors.push(`${prefix}: previewPath does not match its ID.`)

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
      const svg = fs.readFileSync(previewPath, 'utf8')
      if (!svg.includes('viewBox="0 0 1600 900"')) errors.push(`${prefix}: preview must use viewBox 0 0 1600 900.`)
      if (/<image\b/i.test(svg) || /(?:href|src)=["']https?:/i.test(svg)) errors.push(`${prefix}: preview contains an external or raster resource.`)
    }
  })

  const previewFiles = fs.readdirSync(previewDirectory).filter((name) => /^REF-\d{6}\.svg$/.test(name)).sort()
  const expectedFiles = expectedIds.map((id) => `${id}.svg`)
  if (JSON.stringify(previewFiles) !== JSON.stringify(expectedFiles)) errors.push('public/previews must contain exactly REF-000001.svg through REF-000100.svg.')
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
