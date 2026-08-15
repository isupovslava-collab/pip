import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Curated Core strategy and Result Quality Mix', () => {
  it('documents independent visual/type gates and non-binding coverage', () => {
    const doc = readFileSync('docs/curated-core-strategy.md', 'utf8')
    expect(doc).toContain('contentTypePoVerificationStatus === verified')
    expect(doc).toContain('separate, explicit gates')
    expect(doc).toContain('explicitly non-binding')
    expect(doc).toContain('Synthetic schematics')
  })

  it('publishes a quality-mix report with every tier and content-type breakdown', () => {
    const report = JSON.parse(readFileSync('reports/result-quality-mix.json', 'utf8'))
    expect(report.queriesTested).toBeGreaterThan(0)
    expect(report.averageTop6).toEqual(expect.objectContaining({ hero: expect.any(Number), gold: expect.any(Number), standard: expect.any(Number), prototype: expect.any(Number) }))
    expect(report.prototypeExposureRate).toEqual(expect.any(Number))
    expect(report.heroGoldShare).toEqual(expect.any(Number))
    expect(Object.keys(report.byContentType).sort()).toEqual(['comparison', 'cover', 'dashboard', 'kpi', 'process', 'story', 'table', 'timeline'])
    expect(report.limitation).toContain('not an automated visual-quality judgment')
  })

  it('registers the report-only command without changing ranking scripts', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(packageJson.scripts['report:result-quality-mix']).toBe('node scripts/report-result-quality-mix.mjs')
    expect(readFileSync('scripts/report-result-quality-mix.mjs', 'utf8')).not.toMatch(/writeFile\([^)]*(references|rankReferences)/)
  })
})
