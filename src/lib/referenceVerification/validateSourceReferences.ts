import { contentTypeIds, scenarioIds } from '../../types/reference.ts'
import type { SourceReference, SourceVerificationReview } from '../../types/sourceReference'
import { findDuplicateSourcePages } from './normalizeSourceReference.ts'

const gateKeys = ['sourceGate', 'documentGate', 'pageGate', 'visualGate', 'contentTypeGate', 'scenarioGate', 'rightsGate'] as const

function validUrl(value: string | null): boolean {
  if (!value) return true
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

export function validateSourceReferences(sources: SourceReference[], reviews: SourceVerificationReview[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const reviewById = new Map(reviews.map((review) => [review.sourceReferenceId, review]))

  for (const source of sources) {
    if (!/^SRC-\d{4}$/.test(source.id)) errors.push(`${source.id}: source ID must match SRC-0000.`)
    if (ids.has(source.id)) errors.push(`${source.id}: duplicate source ID.`)
    ids.add(source.id)
    if (!validUrl(source.primaryUrl) || !validUrl(source.directDocumentUrl) || !validUrl(source.rightsEvidenceUrl)) errors.push(`${source.id}: invalid URL syntax.`)
    if (!contentTypeIds.includes(source.primaryContentTypeId)) errors.push(`${source.id}: invalid content type.`)
    if (!scenarioIds.includes(source.primaryScenarioId)) errors.push(`${source.id}: invalid scenario.`)
    const review = reviewById.get(source.id)
    if (!review) errors.push(`${source.id}: verification review is missing.`)

    if (source.verificationStatus === 'verified') {
      if (source.urlStatus !== 'working') errors.push(`${source.id}: verified URL must be working.`)
      if (source.pageNumber === null && source.slideNumber === null) errors.push(`${source.id}: verified source needs pageNumber or slideNumber.`)
      if (!source.organization.trim()) errors.push(`${source.id}: verified source needs organization.`)
      if (!source.compositionPrinciple.trim()) errors.push(`${source.id}: verified source needs compositionPrinciple.`)
      if (!source.rightsStatus) errors.push(`${source.id}: verified source needs rightsStatus.`)
      if (!review || gateKeys.some((key) => review[key] !== 'pass')) errors.push(`${source.id}: all seven verification gates must pass.`)
    }
    if ((source.rightsStatus === 'explicit-permission' || source.rightsStatus === 'official-embed') && !source.rightsEvidenceUrl) errors.push(`${source.id}: ${source.rightsStatus} requires rightsEvidenceUrl.`)
    if (source.verificationStatus === 'rejected' && !source.rejectionReason) errors.push(`${source.id}: rejected source needs rejectionReason.`)
  }

  for (const duplicateIds of findDuplicateSourcePages(sources)) errors.push(`Duplicate exact source/page: ${duplicateIds.join(', ')}.`)

  const verified = sources.filter(({ verificationStatus }) => verificationStatus === 'verified')
  const presentationCounts = new Map<string, number>()
  const organizationCounts = new Map<string, number>()
  for (const source of verified) {
    const presentation = `${source.organization}|${source.presentationTitle}`
    presentationCounts.set(presentation, (presentationCounts.get(presentation) ?? 0) + 1)
    organizationCounts.set(source.organization, (organizationCounts.get(source.organization) ?? 0) + 1)
  }
  for (const [presentation, count] of presentationCounts) if (count > 2) errors.push(`${presentation}: maximum 2 verified references per presentation.`)
  for (const [organization, count] of organizationCounts) if (count > 4) errors.push(`${organization}: maximum 4 verified references per organization.`)
  if (new Set(verified.map(({ visualDirection }) => visualDirection)).size < Math.min(6, verified.length)) errors.push('Verified core must preserve at least six visual directions when six or more sources are verified.')

  return errors
}
