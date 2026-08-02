import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import referencesData from '../../public/data/references.json'
import { controlQueries } from '../data/controlQueries'
import { goldReferences } from '../data/goldReferences'
import { getContentMatch, rankReferences } from '../services/rankReferences'
import type { Reference, ScenarioId } from '../types/reference'

const references = referencesData as Reference[]
const scenarioIds: ScenarioId[] = ['sales', 'speech', 'project', 'meeting', 'report', 'training', 'strategy', 'budget_defense']

describe('Gold Reference Set', () => {
  it('содержит ровно 24 уникальных референса — по три на сценарий', () => {
    expect(goldReferences).toHaveLength(24)
    expect(new Set(goldReferences.map(({ referenceId }) => referenceId)).size).toBe(24)
    scenarioIds.forEach((scenarioId) => {
      expect(goldReferences.filter((mapping) => mapping.scenarioId === scenarioId)).toHaveLength(3)
    })
  })

  it('связывает каждый контрольный запрос с существующим референсом', () => {
    expect(new Set(goldReferences.map(({ queryId }) => queryId))).toEqual(new Set(controlQueries.map(({ id }) => id)))
    goldReferences.forEach((mapping) => {
      const query = controlQueries.find(({ id }) => id === mapping.queryId)
      const reference = references.find(({ id }) => id === mapping.referenceId)
      expect(query).toBeDefined()
      expect(reference).toBeDefined()
      expect(mapping.scenarioId).toBe(query?.scenarioId)
      expect(mapping.title).toBe(reference?.title)
      expect(mapping.reason.length).toBeGreaterThan(40)
    })
  })

  it('использует содержательные и визуально уникальные SVG/PNG-превью', () => {
    const hashes = new Set<string>()
    goldReferences.forEach(({ referenceId }) => {
      const reference = references.find(({ id }) => id === referenceId)!
      const previewPath = path.resolve('public', reference.previewPath)
      expect(fs.existsSync(previewPath)).toBe(true)
      const preview = fs.readFileSync(previewPath)
      hashes.add(createHash('sha256').update(preview).digest('hex'))
      if (reference.previewPath.endsWith('.svg')) {
        const svg = preview.toString('utf8')
        expect(svg).toContain('data-gold="true"')
        expect(svg).toMatch(/data-layout="gold-\d{2}"/)
        expect(svg.length).toBeGreaterThan(2400)
        expect((svg.match(/<text/g) ?? []).length).toBeGreaterThanOrEqual(10)
      } else {
        expect(preview.toString('ascii', 1, 4)).toBe('PNG')
        expect(preview.readUInt32BE(16)).toBe(1600)
        expect(preview.readUInt32BE(20)).toBe(900)
      }
    })
    expect(hashes.size).toBe(24)
  })

  it('содержит полноценные описания и рекомендации по применению', () => {
    goldReferences.forEach(({ referenceId }) => {
      const reference = references.find(({ id }) => id === referenceId)
      expect(reference?.title.length).toBeGreaterThan(14)
      expect(reference?.summary.length).toBeGreaterThan(120)
      expect(reference?.tags.length).toBeGreaterThanOrEqual(3)
      expect(reference?.useWhen.length).toBeGreaterThanOrEqual(3)
      expect(reference?.avoidWhen.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('сохраняет Gold mapping, не позволяя ему обходить content guardrails', () => {
    goldReferences.forEach(({ queryId, referenceId }) => {
      const query = controlQueries.find(({ id }) => id === queryId)
      expect(query).toBeDefined()
      if (!query) return
      const ranked = rankReferences(references, query)
      const reference = references.find(({ id }) => id === referenceId)!
      if (getContentMatch(reference, query) === 'incompatible') {
        expect(ranked.slice(0, 6).some(({ id }) => id === referenceId)).toBe(false)
      } else if (getContentMatch(reference, query) === 'exact') {
        expect(ranked.slice(0, 6).some(({ id }) => id === referenceId)).toBe(true)
      }
      expect(ranked.every(({ contentMatch }) => contentMatch !== 'incompatible')).toBe(true)
    })
  })
})
