import { EmptyState } from '../components/EmptyState'
import { ReferenceCard } from '../components/ReferenceCard'
import { Icon } from '../components/Icon'
import { useInspirationBoard } from '../hooks/useInspirationBoard'
import type { Reference } from '../types/reference'

export function InspirationBoardPage({ references }: { references: Reference[] }) {
  const { ids } = useInspirationBoard()
  const saved = ids.map((id) => references.find((reference) => reference.id === id)).filter((reference): reference is Reference => Boolean(reference))

  return (
    <section aria-labelledby="board-title">
      <div className="surface mb-8 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-end sm:p-8">
        <div>
          <p className="eyebrow flex items-center gap-2"><Icon name="bookmark" className="h-4 w-4" />Inspiration Board</p>
          <h1 id="board-title" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Моя доска</h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted">Коллекция решений, которые вы хотите сохранить для будущей презентации.</p>
        </div>
        {saved.length > 0 && <p className="inline-flex w-fit items-center rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">Сохранено: {saved.length}</p>}
      </div>
      {saved.length === 0 ? (
        <EmptyState title="На вашей доске пока нет референсов" text="Добавляйте подходящие решения из результатов поиска — они останутся здесь после закрытия браузера." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{saved.map((reference) => <ReferenceCard key={reference.id} reference={reference} />)}</div>
      )}
    </section>
  )
}
