import { Link, useLocation, useParams } from 'react-router-dom'
import { BoardButton } from '../components/BoardButton'
import { DesignDna } from '../components/DesignDna'
import { EmptyState } from '../components/EmptyState'
import { RecommendationReasons } from '../components/RecommendationReasons'
import { ReferenceFeedbackForm } from '../components/ReferenceFeedbackForm'
import { Icon } from '../components/Icon'
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
    <article className="mx-auto max-w-6xl">
      <Link to={query ? { pathname: location.search ? '/search' : '/', search: location.search } : '/board'} className="btn-ghost -ml-3"><Icon name="arrow-left" className="h-4 w-4" />{query ? 'Вернуться к результатам' : 'Вернуться на доску'}</Link>
      <div className="surface mt-2 overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="relative flex items-center bg-slate-100 lg:border-r lg:border-line">
            <img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Превью слайда: ${reference.title}`} className="aspect-video w-full object-contain" />
            {score !== undefined && <span className="absolute right-4 top-4 rounded-xl bg-amber px-4 py-2 text-lg font-bold text-navy shadow-sm">{score}% <span className="text-sm font-medium">соответствия</span></span>}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-9">
            {reference.sourceBacked && <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">Gold Reference</span><span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-sky-800">Source-backed</span></div>}
            <p className="eyebrow">{reference.category}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">{reference.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted">{reference.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">{reference.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-muted">{tag}</span>)}</div>
            <BoardButton id={reference.id} className="mt-7 w-full sm:w-auto" />
          </div>
        </div>
      </div>
      {reasons.length > 0 && <section className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-5 sm:p-7"><RecommendationReasons reasons={reasons} /></section>}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-success"><Icon name="check" className="h-5 w-5" /></span><h2 className="text-xl font-semibold text-navy">Лучше использовать, когда</h2></div><ul className="mt-5 space-y-3 text-muted">{reference.useWhen.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" /><span>{item}</span></li>)}</ul></section>
        <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="warning" className="h-5 w-5" /></span><h2 className="text-xl font-semibold text-navy">Не лучший выбор, когда</h2></div><ul className="mt-5 space-y-3 text-muted">{reference.avoidWhen.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" /><span>{item}</span></li>)}</ul></section>
      </div>
      <div className="surface mt-6 p-3 sm:p-4"><DesignDna values={reference.designDna} /></div>
      <ReferenceFeedbackForm referenceId={reference.id} />
      {reference.sourceBacked && reference.sourceUrl ? (
        <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="source-heading">
          <p className="eyebrow">Открытый материал для изучения</p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 id="source-heading" className="text-xl font-semibold text-navy">Первоисточник</h2>
              <p className="mt-2 font-semibold text-navy">{reference.sourceTitle}</p>
              <p className="mt-1 text-sm text-muted">{reference.sourceOrganization}</p>
            </div>
            <a href={reference.sourceUrl} target="_blank" rel="noreferrer" className="btn-primary shrink-0">Открыть первоисточник<Icon name="arrow-right" className="h-4 w-4" /></a>
          </div>
          <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted">Preview создан PIP на основе композиционного принципа открытого источника. Текст, данные и визуальное решение оригинальны; внешний слайд не хранится в библиотеке.</p>
          {reference.sourceNotes && <p className="mt-3 text-sm leading-6 text-muted">{reference.sourceNotes}</p>}
        </section>
      ) : <p className="mt-5 px-1 text-sm text-muted">Источник: {reference.sourceLabel}</p>}
    </article>
  )
}
