import { access, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const [{ coverRecoveryRound2Candidates, coverRound1Decisions, coverRound2FinalDecisionLog, coverRound2FinalDecisions }, { isCuratedCoreEligible }] = await Promise.all([
  vite.ssrLoadModule('/src/data/coverRecoveryCandidates.ts'),
  vite.ssrLoadModule('/src/services/selectCuratedCore.ts'),
])
await vite.close()
const references = JSON.parse(await readFile(join(root, 'public/data/references.json'), 'utf8'))
const errors = []
const ids = coverRecoveryRound2Candidates.map(({ id }) => id)
if (new Set(ids).size !== ids.length) errors.push('Duplicate candidate IDs.')
if (coverRecoveryRound2Candidates.length < 5) errors.push('Round 2 requires at least five candidates.')
if (new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily)).size < 3) errors.push('Round 2 requires at least three visual families.')
const allowedFamilies = new Set(['image_led_editorial', 'typographic_bold', 'atmospheric_abstract', 'large_year_editorial', 'minimal_statement'])
const allowedStatuses = new Set(['review_ready', 'preferred'])
const round1Ids = new Set(coverRound1Decisions.map(({ candidateId }) => candidateId))
const hashes = new Map()

for (const candidate of coverRecoveryRound2Candidates) {
  if (!/^(COVER-R2-0[1-3][AB]|COVER-CAND-004|REF-000016)$/.test(candidate.id)) errors.push(`${candidate.id}: invalid ID.`)
  if (!candidate.title?.trim() || !candidate.rationale?.trim() || !candidate.poFeedbackApplied?.trim()) errors.push(`${candidate.id}: missing title, rationale or applied feedback.`)
  if (!allowedFamilies.has(candidate.visualFamily)) errors.push(`${candidate.id}: invalid visual family.`)
  if (!allowedStatuses.has(candidate.reviewStatus)) errors.push(`${candidate.id}: invalid review status.`)
  if (candidate.productionExposure !== false || candidate.curatedCoreStatus !== 'review_only') errors.push(`${candidate.id}: candidate audit record must remain isolated from production.`)
  if (candidate.width !== 1600 || candidate.height !== 900) errors.push(`${candidate.id}: metadata must be 1600x900.`)
  if (candidate.origin === 'revised' && (candidate.revisionRound !== 2 || !candidate.parentCandidateId || !round1Ids.has(candidate.parentCandidateId) || !candidate.revisionReason?.trim())) errors.push(`${candidate.id}: invalid Round 2 lineage.`)
  if (candidate.knownOverlapIssue && candidate.id !== 'COVER-R2-03B') errors.push(`${candidate.id}: unexpected overlap issue.`)
  const assetPath = join(root, 'public', candidate.previewPath)
  try {
    await access(assetPath)
    const asset = await readFile(assetPath)
    const hash = createHash('sha256').update(asset).digest('hex')
    if (hashes.has(hash)) errors.push(`${candidate.id}: duplicate asset hash with ${hashes.get(hash)}.`)
    hashes.set(hash, candidate.id)
    if (candidate.previewPath.endsWith('.svg')) {
      const svg = asset.toString('utf8')
      if (!/<svg[^>]+width="1600"[^>]+height="900"[^>]+viewBox="0 0 1600 900"/.test(svg)) errors.push(`${candidate.id}: SVG dimensions/viewBox mismatch.`)
      if (/<image\b|(?:href|xlink:href)="https?:\/\//.test(svg)) errors.push(`${candidate.id}: external or embedded image is forbidden.`)
    } else if (candidate.previewPath.endsWith('.png')) {
      if (asset.toString('ascii', 1, 4) !== 'PNG' || asset.readUInt32BE(16) !== 1600 || asset.readUInt32BE(20) !== 900) errors.push(`${candidate.id}: PNG dimensions must be 1600x900.`)
    }
  } catch {
    errors.push(`${candidate.id}: preview asset missing or unreadable.`)
  }
}

const approvedDecisions = coverRound2FinalDecisions.filter(({ decision }) => decision === 'approved')
const reviseDecisions = coverRound2FinalDecisions.filter(({ decision }) => decision === 'revise_visual')
if (coverRound2FinalDecisionLog.round !== 'cover-round-2-final' || coverRound2FinalDecisionLog.reviewedBy !== 'product_owner') errors.push('Final PO audit metadata is invalid.')
if (coverRound2FinalDecisions.length !== 4 || approvedDecisions.length !== 3 || reviseDecisions.length !== 1) errors.push('Final PO decision set must contain three APPROVE and one REVISE.')
if (coverRound2FinalDecisions.map(({ rank }) => rank).join(',') !== '1,2,3,4') errors.push('Final PO ranking must be 1–4.')
if (new Set(approvedDecisions.map(({ productionReferenceId }) => productionReferenceId)).size !== 3 || approvedDecisions.some(({ productionReferenceId }) => !productionReferenceId)) errors.push('Approved candidates require three distinct production mappings.')
const reviseDecision = reviseDecisions[0]
if (reviseDecision?.candidateId !== 'COVER-R2-03B' || reviseDecision.productionReferenceId !== null) errors.push('The dark 2027 candidate must remain revision-only.')
if (!coverRecoveryRound2Candidates.find(({ id }) => id === 'COVER-R2-03B')?.knownOverlapIssue) errors.push('The 2027 overlap issue must remain explicit until revision approval.')

const productionCovers = references.filter((reference) => isCuratedCoreEligible(reference) && reference.primaryContentTypeId === 'cover')
if (productionCovers.length !== 3) errors.push(`Cover production count must be 3, received ${productionCovers.length}.`)
const productionCoverIds = new Set(productionCovers.map(({ id }) => id))
for (const decision of approvedDecisions) {
  if (!productionCoverIds.has(decision.productionReferenceId)) errors.push(`${decision.candidateId}: production mapping ${decision.productionReferenceId} is not eligible.`)
  const candidate = coverRecoveryRound2Candidates.find(({ id }) => id === decision.candidateId)
  const production = references.find(({ id }) => id === decision.productionReferenceId)
  if (!candidate || !production) continue
  const candidateHash = createHash('sha256').update(await readFile(join(root, 'public', candidate.previewPath))).digest('hex')
  const productionHash = createHash('sha256').update(await readFile(join(root, 'public', production.previewPath))).digest('hex')
  if (candidateHash !== productionHash) errors.push(`${decision.candidateId}: production preview does not match the approved candidate.`)
}
if (!productionCovers.find(({ id, title }) => id === 'REF-000016' && title === 'Будущее не случается. Мы переходим в него.')) errors.push('REF-000016 must be the approved primary Cover.')

if (errors.length) {
  console.error(`COVER CANDIDATE QUALITY: FAIL\n${errors.map((error) => `- ${error}`).join('\n')}`)
  process.exit(1)
}
console.log('COVER CANDIDATE QUALITY: PASS')
console.log(`Round 2 candidates: ${coverRecoveryRound2Candidates.length}`)
console.log(`Distinct visual families: ${new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily)).size}`)
console.log('Approved production Cover references: 3')
console.log('Revision production exposure: 0')
console.log('Missing assets: 0')
console.log('Duplicate asset hashes: 0')
