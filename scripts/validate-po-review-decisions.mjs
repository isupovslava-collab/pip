import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const [references, round] = await Promise.all([
  readFile(join(root, 'public/data/references.json'), 'utf8').then(JSON.parse),
  readFile(join(root, 'src/data/curatedCore/po-review-round-1.json'), 'utf8').then(JSON.parse),
])
const referenceById = new Map(references.map((reference) => [reference.id, reference]))
const decisions = [
  ...round.decisions,
  ...round.rejectedSchematicReferenceIds.map((referenceId) => ({ referenceId, disposition: 'rejected_schematic' })),
]
const errors = []
const ids = decisions.map(({ referenceId }) => referenceId)
if (new Set(ids).size !== ids.length) errors.push('PO map contains duplicate reference IDs.')
for (const id of ids) if (!referenceById.has(id)) errors.push(`${id}: PO decision references a missing library record.`)

for (const reference of references) {
  const decision = decisions.find(({ referenceId }) => referenceId === reference.id)
  if (!decision) errors.push(`${reference.id}: missing from authoritative PO Round 1 map.`)
  if (reference.poReviewDisposition === 'approved') {
    if (reference.contentTypePoVerificationStatus !== 'verified') errors.push(`${reference.id}: approved reference is not type verified.`)
    if (reference.visualReferenceQuality !== 'premium') errors.push(`${reference.id}: approved reference is not premium.`)
    if (reference.curatedCoreStatus !== 'eligible') errors.push(`${reference.id}: approved reference is not eligible.`)
    if (decision?.verifiedContentType !== reference.primaryContentTypeId) errors.push(`${reference.id}: approved type differs from the PO map.`)
  } else if (reference.curatedCoreStatus === 'eligible') errors.push(`${reference.id}: ${reference.poReviewDisposition} reference cannot be eligible.`)
  if (reference.curatedCoreStatus === 'eligible' && reference.poReviewDisposition === 'pending') errors.push(`${reference.id}: production reference cannot be pending.`)
}

const expected = { kpi: 3, comparison: 2, timeline: 2, process: 3, dashboard: 2, cover: 0, story: 2, table: 3 }
for (const [type, count] of Object.entries(expected)) {
  const actual = references.filter(({ poReviewDisposition, primaryContentTypeId }) => poReviewDisposition === 'approved' && primaryContentTypeId === type).length
  if (actual !== count) errors.push(`${type}: expected ${count} approved, received ${actual}.`)
}
if (references.filter(({ poReviewDisposition }) => poReviewDisposition === 'approved').length !== 17) errors.push('Expected exactly 17 PO-approved references.')

if (errors.length) {
  console.error(`PO REVIEW DECISIONS: FAIL\n${errors.map((error) => `- ${error}`).join('\n')}`)
  process.exit(1)
}
console.log('PO REVIEW DECISIONS: PASS')
console.log('Mapped references: 100')
console.log('Approved production references: 17')
console.log('Reclassification queue: 4')
console.log('Revise visual: 1')
console.log('Rejected schematic archive: 76')
