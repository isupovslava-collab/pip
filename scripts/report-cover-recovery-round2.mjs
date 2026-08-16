import { access, readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { coverRecoveryRound2Candidates, coverRound1Decisions } = await vite.ssrLoadModule('/src/data/coverRecoveryCandidates.ts')
await vite.close()
const exists = async (previewPath) => { try { await access(join(root, 'public', previewPath)); return true } catch { return false } }
const assets = await Promise.all(coverRecoveryRound2Candidates.map(async (candidate) => ({ id: candidate.id, exists: await exists(candidate.previewPath) })))
const byOrigin = Object.fromEntries(['baseline', 'revised', 'reclassified'].map((origin) => [origin, coverRecoveryRound2Candidates.filter((candidate) => candidate.origin === origin).length]))
const byVisualFamily = Object.fromEntries([...new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily))].sort().map((family) => [family, coverRecoveryRound2Candidates.filter(({ visualFamily }) => visualFamily === family).length]))
const duplicateCompositionWarnings = [...new Set(coverRecoveryRound2Candidates.map(({ compositionFamily }) => compositionFamily).filter((family, index, all) => all.indexOf(family) !== index))]
const descendants = (parentCandidateId) => coverRecoveryRound2Candidates.filter((candidate) => candidate.parentCandidateId === parentCandidateId)
const feedbackChecks = {
  candidate1FeedbackApplied: descendants('COVER-CAND-001').length >= 2 && coverRound1Decisions.find(({ candidateId }) => candidateId === 'COVER-CAND-001')?.reviewStatus === 'revise',
  candidate2FeedbackApplied: descendants('COVER-CAND-002').length >= 2 && coverRound1Decisions.find(({ candidateId }) => candidateId === 'COVER-CAND-002')?.reviewStatus === 'revise',
  candidate3OverlapFixed: descendants('COVER-CAND-003').length >= 2 && descendants('COVER-CAND-003').every(({ knownOverlapIssue }) => knownOverlapIssue === false),
  candidate4Preserved: coverRecoveryRound2Candidates.some(({ id, origin, previewPath }) => id === 'COVER-CAND-004' && origin === 'baseline' && previewPath === 'cover-recovery/COVER-CAND-004.svg'),
  ref000016Included: coverRecoveryRound2Candidates.some(({ id, origin, currentContentType, proposedContentType, productionExposure }) => id === 'REF-000016' && origin === 'reclassified' && currentContentType === 'story' && proposedContentType === 'cover' && productionExposure === false),
}
const report = {
  report: 'COVER RECOVERY ROUND 2',
  totalRound2Candidates: coverRecoveryRound2Candidates.length,
  ...byOrigin,
  byVisualFamily,
  productionExposed: coverRecoveryRound2Candidates.filter(({ productionExposure }) => productionExposure).length,
  missingAssets: assets.filter(({ exists }) => !exists).map(({ id }) => id),
  duplicateCompositionWarnings,
  candidatesReadyForPoReview: coverRecoveryRound2Candidates.filter(({ reviewStatus }) => reviewStatus === 'review_ready' || reviewStatus === 'preferred').length,
  feedbackChecks,
}
const pass = (value) => value ? 'PASS' : 'FAIL'
const lines = ['# COVER RECOVERY ROUND 2', '', `Total Round 2 candidates: ${report.totalRound2Candidates}`, `Baseline: ${report.baseline}`, `Revised: ${report.revised}`, `Reclassified: ${report.reclassified}`, `Production exposed: ${report.productionExposed}`, `Missing assets: ${report.missingAssets.length}`, `Duplicate composition warnings: ${report.duplicateCompositionWarnings.length}`, `Candidates ready for PO review: ${report.candidatesReadyForPoReview}`, '', '## By visual family', '', ...Object.entries(byVisualFamily).map(([family, count]) => `- ${family}: ${count}`), '', `Candidate 1 feedback applied: ${pass(feedbackChecks.candidate1FeedbackApplied)}`, `Candidate 2 feedback applied: ${pass(feedbackChecks.candidate2FeedbackApplied)}`, `Candidate 3 overlap fixed: ${pass(feedbackChecks.candidate3OverlapFixed)}`, `Candidate 4 preserved: ${pass(feedbackChecks.candidate4Preserved)}`, `REF-000016 included: ${pass(feedbackChecks.ref000016Included)}`, '']
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/cover-recovery-round2.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/cover-recovery-round2.md'), lines.join('\n'))
console.log(lines.join('\n'))

