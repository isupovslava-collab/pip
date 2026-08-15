import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('Curated Core calibration reports', () => {
  it('reports PO verification and exact coverage gaps', () => {
    const report = JSON.parse(readFileSync('reports/curated-core.json', 'utf8'))
    expect(report).toMatchObject({ physicalReferences: 100, eligibleTotal: 5, poContentTypeVerifiedCount: 5, pendingTypeVerification: 94, reclassifyCount: 1, visualPremiumButTypeUnverified: 1, coverageTargetPerType: 2, coverageTargetIsBinding: false })
    expect(report.byContentType.comparison).toMatchObject({ exactPremiumVerified: 1, targetGap: 1 })
    expect(report.byContentType.dashboard).toMatchObject({ exactPremiumVerified: 0, targetGap: 2 })
  })

  it('reports the known reclassification without mutating production data', () => {
    const calibration = JSON.parse(readFileSync('reports/curated-core-calibration.json', 'utf8'))
    const production = JSON.parse(readFileSync('reports/production-result-quality.json', 'utf8'))
    expect(calibration).toMatchObject({ totalCandidates: 100, visualPremium: 6, typeVerified: 5, reclassify: 1, rejected: 0, productionEligible: 5, coverageTargetIsBinding: false })
    expect(calibration.knownMisclassifications).toEqual([expect.objectContaining({ id: 'REF-000019', currentType: 'comparison', proposedType: 'story' })])
    expect(calibration.coverageGaps.timeline).toEqual({ approved: 0, target: 2, gap: 2 })
    expect(production).toMatchObject({ wrongTypeExposure: 0, nonPremiumExposure: 0, typeUnverifiedExposure: 0 })
  })

  it('registers report-only scripts', () => {
    const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts
    expect(scripts['report:curated-core-calibration']).toBe('node scripts/report-curated-core-calibration.mjs')
    expect(readFileSync('scripts/report-curated-core-calibration.mjs', 'utf8')).not.toMatch(/writeFile\([^)]*references\.json/)
  })
})
