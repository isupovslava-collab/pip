import { contentTypeIds, type ContentTypeId } from '../../types/reference.ts'
import type { SourceReference, SourceRightsStatus } from '../../types/sourceReference'

export interface SourceCoverageRow {
  contentTypeId: ContentTypeId
  candidateCount: number
  sourceFoundCount: number
  verifiedCount: number
  rejectedCount: number
  gapToTarget3: number
}

export function sourceReferenceCoverage(sources: SourceReference[]): SourceCoverageRow[] {
  return contentTypeIds.map((contentTypeId) => {
    const matching = sources.filter((source) => source.primaryContentTypeId === contentTypeId)
    const verifiedCount = matching.filter(({ verificationStatus }) => verificationStatus === 'verified').length
    return {
      contentTypeId,
      candidateCount: matching.length,
      sourceFoundCount: matching.filter(({ verificationStatus }) => verificationStatus === 'source_found').length,
      verifiedCount,
      rejectedCount: matching.filter(({ verificationStatus }) => verificationStatus === 'rejected').length,
      gapToTarget3: Math.max(0, 3 - verifiedCount),
    }
  })
}

export function countBy<T extends string>(values: T[]): Array<[T, number]> {
  return [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<T, number>())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

export function sourceReferenceSummary(sources: SourceReference[]) {
  const verified = sources.filter(({ verificationStatus }) => verificationStatus === 'verified')
  return {
    total: sources.length,
    candidate: sources.filter(({ verificationStatus }) => verificationStatus === 'candidate').length,
    sourceFound: sources.filter(({ verificationStatus }) => verificationStatus === 'source_found').length,
    verified: verified.length,
    rejected: sources.filter(({ verificationStatus }) => verificationStatus === 'rejected').length,
    uniqueOrganizations: new Set(verified.map(({ organization }) => organization)).size,
    uniquePresentations: new Set(verified.map(({ organization, presentationTitle }) => `${organization}|${presentationTitle}`)).size,
    rights: countBy(verified.map(({ rightsStatus }) => rightsStatus as SourceRightsStatus)),
    origins: countBy(verified.flatMap(({ researchOrigins }) => researchOrigins)),
    coverage: sourceReferenceCoverage(sources),
  }
}
