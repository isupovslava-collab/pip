import type { RankedReference } from '../types/reference'
import { EmptyState } from './EmptyState'
import { ReferenceCard } from './ReferenceCard'

export function ResultsGrid({ references }: { references: RankedReference[] }) {
  if (!references.length) return <EmptyState title="Подходящие решения не найдены" text="Измените параметры и попробуйте снова." />
  return <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{references.map((reference, index) => <ReferenceCard key={reference.id} reference={reference} rank={index + 1} />)}</div>
}
