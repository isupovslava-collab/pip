import type { Reference } from '../types/reference'

export async function loadReferences(): Promise<Reference[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/references.json`)
  if (!response.ok) throw new Error('Не удалось загрузить библиотеку')
  return response.json() as Promise<Reference[]>
}
