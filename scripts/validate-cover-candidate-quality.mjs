import { access, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const [{ coverRecoveryRound2Candidates, coverRound1Decisions }, { isCuratedCoreEligible }] = await Promise.all([
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
  if (candidate.productionExposure !== false || candidate.curatedCoreStatus !== 'review_only') errors.push(`${candidate.id}: production exposure must be false.`)
  if (candidate.width !== 1600 || candidate.height !== 900) errors.push(`${candidate.id}: metadata must be 1600x900.`)
  if (candidate.origin === 'revised' && (candidate.revisionRound !== 2 || !candidate.parentCandidateId || !round1Ids.has(candidate.parentCandidateId) || !candidate.revisionReason?.trim())) errors.push(`${candidate.id}: invalid Round 2 lineage.`)
  if (candidate.knownOverlapIssue !== false) errors.push(`${candidate.id}: known overlap issue is unresolved.`)
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

const ref16 = references.find(({ id }) => id === 'REF-000016')
if (!ref16 || ref16.primaryContentTypeId !== 'story' || ref16.proposedPrimaryContentType !== 'cover' || ref16.poReviewDisposition !== 'reclassify' || isCuratedCoreEligible(ref16)) errors.push('REF-000016 must remain a non-production Story-to-Cover reclassification.')
if (references.filter(isCuratedCoreEligible).some(({ primaryContentTypeId }) => primaryContentTypeId === 'cover')) errors.push('Cover production count must remain zero.')

if (errors.length) {
  console.error(`COVER CANDIDATE QUALITY: FAIL\n${errors.map((error) => `- ${error}`).join('\n')}`)
  process.exit(1)
}
console.log('COVER CANDIDATE QUALITY: PASS')
console.log(`Round 2 candidates: ${coverRecoveryRound2Candidates.length}`)
console.log(`Distinct visual families: ${new Set(coverRecoveryRound2Candidates.map(({ visualFamily }) => visualFamily)).size}`)
console.log('Production exposure: 0')
console.log('Missing assets: 0')
console.log('Duplicate asset hashes: 0')

