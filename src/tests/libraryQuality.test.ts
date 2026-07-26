import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import references from '../../public/data/references.json'
import type { Reference } from '../types/reference'

const library = references as Reference[]
const coverageMinimums = {
  scenarioIds: { sales: 20, speech: 15, project: 20, meeting: 18, report: 20, training: 16, strategy: 18, budget_defense: 15 },
  personaIds: { ceo: 15, cfo: 12, board: 15, manager: 25, employees: 15, technical_experts: 12, team: 18, client: 20 },
  goalIds: { approve: 20, decide: 25, align: 18, explain_results: 18, teach: 12, explain_problem: 15, compare_options: 20, inspire: 15 },
  styleIds: { executive: 25, corporate: 35, consulting: 22, modern: 28, industrial: 15, minimal: 20 },
  contentTypeIds: { kpi: 18, comparison: 20, timeline: 18, process: 18, dashboard: 15, cover: 15, story: 20, table: 18 },
} as const

describe('качество библиотеки из 100 референсов', () => {
  it('выполняет минимальные квоты покрытия', () => {
    Object.entries(coverageMinimums).forEach(([field, minimums]) => {
      Object.entries(minimums).forEach(([value, minimum]) => {
        const count = library.filter((reference) => (reference[field as keyof Reference] as string[]).includes(value)).length
        expect(count, `${field}.${value}`).toBeGreaterThanOrEqual(minimum)
      })
    })
  })

  it('содержит все 100 оригинальных preview', () => {
    const hashes = new Set<string>()
    library.forEach((reference) => {
      const previewPath = path.resolve(process.cwd(), 'public', reference.previewPath)
      expect(fs.existsSync(previewPath), reference.previewPath).toBe(true)
      const preview = fs.readFileSync(previewPath)
      if (reference.previewPath.endsWith('.svg')) expect(preview.toString()).toContain('viewBox="0 0 1600 900"')
      hashes.add(crypto.createHash('sha256').update(preview).digest('hex'))
    })
    expect(hashes.size).toBe(100)
  })

  it('не содержит точных дубликатов текста и метаданных', () => {
    expect(new Set(library.map(({ title }) => title.toLocaleLowerCase('ru'))).size).toBe(100)
    expect(new Set(library.map(({ summary }) => summary.toLocaleLowerCase('ru'))).size).toBe(100)
    const signatures = library.map((reference) => [reference.scenarioIds, reference.personaIds, reference.goalIds, reference.styleIds, reference.contentTypeIds]
      .map((values) => [...values].sort().join(','))
      .join('|'))
    expect(new Set(signatures).size).toBe(100)
  })
})
