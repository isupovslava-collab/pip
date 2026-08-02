import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import references from '../../public/data/references.json'
import manifest from '../../tools/hero-references/manifest.json'

const root = process.cwd()
const expectedScenarios = ['sales', 'speech', 'project', 'meeting', 'report', 'training', 'strategy', 'budget_defense']

function pngSize(file: string) {
  const bytes = fs.readFileSync(file)
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), hash: crypto.createHash('sha256').update(bytes).digest('hex') }
}

describe('Sprint 7 Hero Reference integration gate', () => {
  it('содержит ровно восемь уникальных сценариев и полные source records', () => {
    expect(manifest).toHaveLength(8)
    expect(manifest.map(({ scenario }) => scenario).sort()).toEqual([...expectedScenarios].sort())
    expect(new Set(manifest.map(({ id }) => id)).size).toBe(8)
    manifest.forEach((item) => {
      expect(item.id).toMatch(/^HERO-[A-Z]+-001$/)
      expect(item.sourceUrl).toMatch(/^https:\/\//)
      expect(item.sourceOrganization.length).toBeGreaterThan(2)
      expect(item.sourceTitle.length).toBeGreaterThan(4)
      expect(item.rightsStatus).toBe('link-only-no-local-copy')
      expect(item.checkedAt).toBe('2026-08-02')
      expect(item.studied.length).toBeGreaterThan(40)
      expect(item.createdByPip.length).toBeGreaterThan(40)
    })
  })

  it('хранит отдельный HTML/CSS-исходник для каждой композиции', () => {
    const folders: Record<string, string> = { budget_defense: 'budget-defense' }
    manifest.forEach(({ scenario }) => {
      const folder = folders[scenario] ?? scenario
      expect(fs.existsSync(path.join(root, 'tools', 'hero-references', folder, 'index.html'))).toBe(true)
      expect(fs.existsSync(path.join(root, 'tools', 'hero-references', folder, 'style.css'))).toBe(true)
    })
  })

  it('публикует восемь уникальных PNG 1600×900', () => {
    const results = manifest.map(({ preview }) => pngSize(path.join(root, 'public', 'hero-references', preview)))
    results.forEach(({ width, height }) => {
      expect(width).toBeGreaterThanOrEqual(1440)
      expect(height).toBeGreaterThanOrEqual(810)
      expect(width / height).toBeCloseTo(16 / 9, 4)
    })
    expect(new Set(results.map(({ hash }) => hash)).size).toBe(8)
  })

  it('показывает восемь Hero и решения stage gate в отдельной gallery', () => {
    const gallery = fs.readFileSync(path.join(root, 'public', 'hero-reference-review.html'), 'utf8')
    manifest.forEach(({ id, preview, sourceUrl }) => {
      expect(gallery).toContain(`id:'${id}'`)
      expect(gallery).toContain(`preview:'${preview}'`)
      expect(gallery).toContain(sourceUrl)
    })
    expect(gallery).toContain("['APPROVE','REVISE','REJECT']")
    expect(gallery).toContain('Скачать контактный лист')
    expect(gallery).toContain('AWAITING REVIEW')
  })

  it('интегрирует только шесть одобренных Hero под существующими reference ID', () => {
    const productionHeroes = references.filter(({ qualityTier, productionApproved }) => qualityTier === 'hero' && productionApproved)
    expect(productionHeroes).toHaveLength(6)
    expect(new Set(productionHeroes.map(({ heroScenarioId }) => heroScenarioId))).toEqual(new Set(['sales', 'speech', 'project', 'report', 'training', 'budget_defense']))
    expect(productionHeroes.every(({ previewPath }) => previewPath.endsWith('.png'))).toBe(true)
    expect(manifest.find(({ scenario }) => scenario === 'meeting')).toMatchObject({ productionApproved: false, reviewStatus: 'REVISED — AWAITING PRODUCT OWNER REVIEW' })
    expect(manifest.find(({ scenario }) => scenario === 'strategy')).toMatchObject({ productionApproved: false, reviewStatus: 'REVISED — AWAITING PRODUCT OWNER REVIEW' })
    expect(references).toHaveLength(100)
  })
})
