import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Curated Core calibration reports', () => {
  it('reports PO verification and exact coverage gaps', () => {
    const report = JSON.parse(readFileSync('reports/curated-core.json', 'utf8'))
    expect(report).toMatchObject({ physicalReferences: 100, productionApprovedTotal: 17, maxProductionResults: 3, exactOnly: true, premiumOnly: true, poTypeVerifiedOnly: true, poApprovedOnly: true })
    expect(report.byContentType.comparison).toMatchObject({ approved: 2, targetGap: 0 })
    expect(report.byContentType.dashboard).toMatchObject({ approved: 2, targetGap: 0 })
    expect(report.byContentType.cover).toMatchObject({ approved: 0, targetGap: 3 })
    expect(report.reclassificationQueue).toEqual(['REF-000016', 'REF-000019', 'REF-000030', 'REF-000032'])
  })

  it('reports the known reclassification without mutating production data', () => {
    const calibration = JSON.parse(readFileSync('reports/curated-core-calibration.json', 'utf8'))
    const production = JSON.parse(readFileSync('reports/production-result-quality.json', 'utf8'))
    expect(calibration).toMatchObject({ totalCandidates: 100, productionEligible: 17, coverageTargetIsBinding: false, dispositions: { approved: 17, reclassify: 4, revise_visual: 1, rejected_schematic: 76, rejected_wrong_type: 0, rejected_quality: 1, pending: 1 } })
    expect(calibration.reclassificationQueue).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'REF-000019', currentType: 'comparison', proposedType: 'story' }), expect.objectContaining({ id: 'REF-000032', currentType: 'timeline', proposedType: null })]))
    expect(calibration.coverageGaps.timeline).toEqual({ approved: 2, target: 2, gap: 0 })
    expect(calibration.coverageGaps.cover).toEqual({ approved: 0, target: 3, gap: 3 })
    expect(production).toMatchObject({ wrongTypeExposure: 0, nonPremiumExposure: 0, nonApprovedExposure: 0, rejectedSchematicExposure: 0, reclassifyExposure: 0, reviseExposure: 0 })
  })

  it('registers report-only scripts', () => {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    expect(scripts['report:curated-core-calibration']).toBe('node scripts/report-curated-core-calibration.mjs')
    expect(scripts['report:po-review-round-1']).toBe('node scripts/report-po-review-round-1.mjs')
    expect(scripts['validate:po-review-decisions']).toBe('node scripts/validate-po-review-decisions.mjs')
    expect(readFileSync('scripts/report-curated-core-calibration.mjs', 'utf8')).not.toMatch(/writeFile\([^)]*references\.json/)
  })

  it('publishes the auditable Product Owner Round 1 report', () => {
    const report = JSON.parse(readFileSync('reports/po-review-round-1.json', 'utf8'))
    expect(report).toMatchObject({ round: 'sprint-9-1-manual', physicalReferences: 100, approvedTotal: 17, byDisposition: { approved: 17, reclassify: 4, revise_visual: 1, rejected_schematic: 76, rejected_wrong_type: 0, rejected_quality: 1, pending: 1 } })
    expect(report.byType).toEqual({ dashboard: 2, timeline: 2, cover: 0, kpi: 3, comparison: 2, process: 3, story: 2, table: 3 })
    expect(report.reviewEfficiency.interpretation).toContain('not a market KPI')
  })
})
