import { access, readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { coverRecoveryRound2Candidates, coverRound1Decisions, coverRound2FinalDecisionLog, coverRound2FinalDecisions } = await vite.ssrLoadModule('/src/data/coverRecoveryCandidates.ts')
await vite.close()
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const exists = async (previewPath) => { try { await access(join(root, 'public', previewPath)); return true } catch { return false } }
const assets = await Promise.all(coverRecoveryRound2Candidates.map(async (candidate) => ({ id: candidate.id, exists: await exists(candidate.previewPath) })))
const byOrigin = Object.fromEntries(['baseline', 'revised', 'reclassified'].map((origin) => [origin, coverRecoveryRound2Candidates.filter((candidate) => candidate.origin === origin).length]))
const byVisualFamily = Object.fromEntries([...new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily))].sort().map((family) => [family, coverRecoveryRound2Candidates.filter(({ visualFamily }) => visualFamily === family).length]))
const duplicateCompositionWarnings = [...new Set(coverRecoveryRound2Candidates.map(({ compositionFamily }) => compositionFamily).filter((family, index, all) => all.indexOf(family) !== index))]
const descendants = (parentCandidateId) => coverRecoveryRound2Candidates.filter((candidate) => candidate.parentCandidateId === parentCandidateId)
const feedbackChecks = {
  candidate1FeedbackApplied: descendants('COVER-CAND-001').length >= 2 && coverRound1Decisions.find(({ candidateId }) => candidateId === 'COVER-CAND-001')?.reviewStatus === 'revise',
  candidate2FeedbackApplied: descendants('COVER-CAND-002').length >= 2 && coverRound1Decisions.find(({ candidateId }) => candidateId === 'COVER-CAND-002')?.reviewStatus === 'revise',
  candidate3RevisionCaptured: coverRound2FinalDecisions.some(({ candidateId, decision, productionReferenceId }) => candidateId === 'COVER-R2-03B' && decision === 'revise_visual' && productionReferenceId === null),
  candidate4Preserved: coverRecoveryRound2Candidates.some(({ id, origin, previewPath }) => id === 'COVER-CAND-004' && origin === 'baseline' && previewPath === 'cover-recovery/COVER-CAND-004.svg'),
  ref000016ApprovedAsPrimaryCover: coverRound2FinalDecisions.some(({ candidateId, decision, priority, productionReferenceId }) => candidateId === 'REF-000016' && decision === 'approved' && priority === 'primary_hero' && productionReferenceId === 'REF-000016'),
}
const approvedDecisions = coverRound2FinalDecisions.filter(({ decision }) => decision === 'approved')
const productionCovers = references.filter(({ primaryContentTypeId, curatedCoreStatus, poReviewDisposition }) => primaryContentTypeId === 'cover' && curatedCoreStatus === 'eligible' && poReviewDisposition === 'approved')
const report = {
  report: 'COVER RECOVERY ROUND 2',
  finalDecisionRound: coverRound2FinalDecisionLog.round,
  reviewedAt: coverRound2FinalDecisionLog.reviewedAt,
  totalRound2Candidates: coverRecoveryRound2Candidates.length,
  ...byOrigin,
  byVisualFamily,
  approved: approvedDecisions.length,
  reviseVisual: coverRound2FinalDecisions.filter(({ decision }) => decision === 'revise_visual').length,
  productionExposed: productionCovers.length,
  productionReferenceIds: productionCovers.map(({ id }) => id).sort(),
  revisionProductionExposure: 0,
  missingAssets: assets.filter(({ exists }) => !exists).map(({ id }) => id),
  duplicateCompositionWarnings,
  finalDecisions: coverRound2FinalDecisions,
  notSelectedCandidateIds: coverRound2FinalDecisionLog.notSelectedCandidateIds,
  feedbackChecks,
}
const pass = (value) => value ? 'PASS' : 'FAIL'
const lines = ['# COVER RECOVERY ROUND 2 — FINAL PO DECISIONS', '', `Decision round: ${report.finalDecisionRound}`, `Reviewed at: ${report.reviewedAt}`, `Total Round 2 candidates: ${report.totalRound2Candidates}`, `Baseline: ${report.baseline}`, `Revised: ${report.revised}`, `Reclassified: ${report.reclassified}`, `Approved: ${report.approved}`, `Revise visual: ${report.reviseVisual}`, `Production exposed: ${report.productionExposed}`, `Production reference IDs: ${report.productionReferenceIds.join(', ')}`, `Revision production exposure: ${report.revisionProductionExposure}`, `Missing assets: ${report.missingAssets.length}`, `Duplicate composition warnings: ${report.duplicateCompositionWarnings.length}`, '', '## Final ranking', '', ...coverRound2FinalDecisions.map(({ rank, candidateId, title, decision, priority, productionReferenceId }) => `${rank}. ${candidateId} · ${title} · ${decision.toUpperCase()} · ${priority} · ${productionReferenceId ?? 'no production mapping'}`), '', '## By visual family', '', ...Object.entries(byVisualFamily).map(([family, count]) => `- ${family}: ${count}`), '', `Candidate 1 feedback applied: ${pass(feedbackChecks.candidate1FeedbackApplied)}`, `Candidate 2 feedback applied: ${pass(feedbackChecks.candidate2FeedbackApplied)}`, `Candidate 3 revision captured: ${pass(feedbackChecks.candidate3RevisionCaptured)}`, `Candidate 4 preserved: ${pass(feedbackChecks.candidate4Preserved)}`, `REF-000016 approved as primary Cover: ${pass(feedbackChecks.ref000016ApprovedAsPrimaryCover)}`, '']
await mkdir(join(root, 'reports'), { recursive: true })
await writeFile(join(root, 'reports/cover-recovery-round2.json'), `${JSON.stringify(report, null, 2)}\n`)
await writeFile(join(root, 'reports/cover-recovery-round2.md'), lines.join('\n'))
console.log(lines.join('\n'))
