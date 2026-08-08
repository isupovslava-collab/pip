import type { SourceReference } from '../../types/sourceReference'

export function normalizeSourceUrl(value: string): string {
  const url = new URL(value.trim())
  url.hash = ''
  url.hostname = url.hostname.toLowerCase()
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/$/, '')
  return url.toString()
}

export function sourcePageKey(source: Pick<SourceReference, 'organization' | 'presentationTitle' | 'directDocumentUrl' | 'primaryUrl' | 'pageNumber' | 'slideNumber'>): string {
  const documentUrl = normalizeSourceUrl(source.directDocumentUrl ?? source.primaryUrl)
  return [source.organization.trim().toLowerCase(), source.presentationTitle.trim().toLowerCase(), documentUrl, source.pageNumber ?? '', source.slideNumber ?? ''].join('|')
}

export function normalizeSourceReference(source: SourceReference): SourceReference {
  return {
    ...source,
    presentationTitle: source.presentationTitle.trim(),
    originalSlideTitle: source.originalSlideTitle?.trim() || null,
    curatorLabel: source.curatorLabel?.trim() || null,
    organization: source.organization.trim(),
    author: source.author?.trim() || null,
    primaryUrl: normalizeSourceUrl(source.primaryUrl),
    directDocumentUrl: source.directDocumentUrl ? normalizeSourceUrl(source.directDocumentUrl) : null,
    compositionPrinciple: source.compositionPrinciple.trim(),
    visualStrength: source.visualStrength.trim(),
    reuseRecommendation: source.reuseRecommendation.trim(),
    verificationNotes: source.verificationNotes.map((note) => note.trim()).filter(Boolean),
    rejectionReason: source.rejectionReason?.trim() || null,
  }
}

export function findDuplicateSourcePages(sources: SourceReference[]): string[][] {
  const groups = new Map<string, string[]>()
  for (const source of sources) {
    if (source.pageNumber === null && source.slideNumber === null) continue
    const key = sourcePageKey(source)
    groups.set(key, [...(groups.get(key) ?? []), source.id])
  }
  return [...groups.values()].filter((ids) => ids.length > 1)
}
