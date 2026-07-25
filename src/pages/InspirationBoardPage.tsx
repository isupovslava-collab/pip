import { EmptyState } from '../components/EmptyState'
import { ReferenceCard } from '../components/ReferenceCard'
import { useInspirationBoard } from '../hooks/useInspirationBoard'
import type { Reference } from '../types/reference'

export function InspirationBoardPage({ references }: { references: Reference[] }) {
  const { ids } = useInspirationBoard()
  const saved = ids.map((id) => references.find((reference) => reference.id === id)).filter((reference): reference is Reference => Boolean(reference))

  return (
    <section aria-labelledby="board-title">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue">Inspiration Board</p>
        <h1 id="board-title" className="mt-2 text-3xl font-black text-navy sm:text-4xl">Моя доска</h1>
        {saved.length > 0 && <p className="mt-2 text-muted">Сохранено референсов: {saved.length}</p>}
      </div>
      {saved.length === 0 ? (
        <EmptyState title="На вашей доске пока нет референсов" text="Добавляйте подходящие решения из результатов поиска — они останутся здесь после закрытия браузера." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{saved.map((reference) => <ReferenceCard key={reference.id} reference={reference} />)}</div>
      )}
    </section>
  )
}
