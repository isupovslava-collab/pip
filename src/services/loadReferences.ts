import type { Reference } from '../types/reference'

export type StoredReference = Omit<Reference, 'contentTypePoVerificationStatus'> & Partial<Pick<Reference, 'contentTypePoVerificationStatus'>>

export function normalizeReferences(references: StoredReference[]): Reference[] {
  return references.map((reference) => ({
    ...reference,
    contentTypePoVerificationStatus: reference.contentTypePoVerificationStatus ?? 'pending',
  }))
}

export async function loadReferences(): Promise<Reference[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/references.json`)
  if (!response.ok) throw new Error('Не удалось загрузить библиотеку')
  return normalizeReferences(await response.json() as StoredReference[])
}
