import { Link, useLocation, useParams } from 'react-router-dom'
import { BoardButton } from '../components/BoardButton'
import { DesignDna } from '../components/DesignDna'
import { EmptyState } from '../components/EmptyState'
import { RecommendationReasons } from '../components/RecommendationReasons'
import { rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'

interface ReferencePageProps { references: Reference[]; query: SearchQuery | null }

export function ReferencePage({ references, query }: ReferencePageProps) {
  const { id } = useParams()
  const location = useLocation()
  const reference = references.find((item) => item.id === id)
  if (!reference) return <EmptyState title="Референс не найден" text="Возможно, ссылка устарела или в адресе есть ошибка." />

  const ranked = query ? rankReferences([reference], query)[0] : null
  const routeState = location.state as { score?: number; reasons?: string[] } | null
  const score = routeState?.score ?? ranked?.score
  const reasons = routeState?.reasons ?? ranked?.reasons ?? []

  return (
    <article>
      <Link to={query ? '/' : '/board'} className="inline-flex min-h-11 items-center font-bold text-blue hover:underline">← {query ? 'Вернуться к результатам' : 'Вернуться на доску'}</Link>
      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="relative bg-slate-100">
          <img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Схематичное превью: ${reference.title}`} className="aspect-video w-full object-cover" />
          {score !== undefined && <span className="absolute right-4 top-4 rounded-full bg-navy px-4 py-2 text-lg font-black text-white">{score}% соответствия</span>}
        </div>
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-wider text-blue">{reference.category}</p>
              <h1 className="mt-2 text-3xl font-black text-navy sm:text-4xl">{reference.title}</h1>
              <p className="mt-4 text-lg leading-8 text-muted">{reference.summary}</p>
            </div>
            <BoardButton id={reference.id} className="shrink-0" />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">{reference.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-muted">{tag}</span>)}</div>
          {reasons.length > 0 && <section className="mt-9 rounded-xl bg-sky-50 p-5 sm:p-6"><RecommendationReasons reasons={reasons} /></section>}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-line p-5"><h2 className="text-xl font-bold text-navy">Лучше использовать, когда</h2><ul className="mt-4 space-y-3 text-muted">{reference.useWhen.map((item) => <li key={item} className="flex gap-3"><span className="text-blue">✓</span><span>{item}</span></li>)}</ul></section>
            <section className="rounded-xl border border-line p-5"><h2 className="text-xl font-bold text-navy">Не лучший выбор, когда</h2><ul className="mt-4 space-y-3 text-muted">{reference.avoidWhen.map((item) => <li key={item} className="flex gap-3"><span className="text-amber">—</span><span>{item}</span></li>)}</ul></section>
          </div>
          <div className="mt-10 border-t border-line pt-9"><DesignDna values={reference.designDna} /></div>
          <p className="mt-9 text-sm text-muted">Источник: {reference.sourceLabel}</p>
        </div>
      </div>
    </article>
  )
}
