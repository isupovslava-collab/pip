import { Link, useLocation, useParams } from 'react-router-dom'
import { BoardButton } from '../components/BoardButton'
import { DesignDna } from '../components/DesignDna'
import { EmptyState } from '../components/EmptyState'
import { RecommendationReasons } from '../components/RecommendationReasons'
import { ReferenceFeedbackForm } from '../components/ReferenceFeedbackForm'
import { Icon } from '../components/Icon'
import { IntelligenceFeedbackForm } from '../components/IntelligenceFeedbackForm'
import { ReferenceIntelligencePanel } from '../components/ReferenceIntelligencePanel'
import { VerifiedSourcePanel } from '../components/VerifiedSourcePanel'
import { referenceIntelligenceById } from '../data/sourceReferences/reference-intelligence'
import { sourceReferenceById } from '../data/sourceReferences/source-references'
import { rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'
import { isTestMode } from '../utils/testMode'
import { isProductionEligibleSourceReference } from '../lib/referenceVerification/productApproval'

interface ReferencePageProps { references: Reference[]; query: SearchQuery | null }

export function ReferencePage({ references, query }: ReferencePageProps) {
  const { id } = useParams()
  const location = useLocation()
  const reference = references.find((item) => item.id === id)
  if (!reference) return <EmptyState title="Референс не найден" text="Возможно, ссылка устарела или в адресе есть ошибка." />

  const ranked = query ? rankReferences([reference], query)[0] : null
  const routeState = location.state as { score?: number; reasons?: string[]; curatedCore?: boolean } | null
  const score = routeState?.score ?? ranked?.score
  const reasons = routeState?.reasons ?? ranked?.reasons ?? []
  const intelligence = referenceIntelligenceById.get(reference.id)
  const linkedSources = (intelligence?.sourceReferenceIds ?? []).flatMap((sourceId) => {
    const source = sourceReferenceById.get(sourceId)
    return source && isProductionEligibleSourceReference(source) ? [source] : []
  })

  return (
    <article className="mx-auto max-w-6xl">
      <Link to={query ? { pathname: location.search ? '/search' : '/', search: location.search } : '/board'} className="btn-ghost -ml-3"><Icon name="arrow-left" className="h-4 w-4" />{query ? 'Вернуться к результатам' : 'Вернуться на доску'}</Link>
      <div className="surface mt-2 overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="relative flex min-w-0 items-center overflow-hidden bg-slate-100 p-2 sm:p-4 lg:border-r lg:border-line">
            <img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Превью слайда: ${reference.title}`} className="block aspect-video h-auto max-w-full object-contain" />
            {score !== undefined && !routeState?.curatedCore && <span className="absolute right-3 top-3 max-w-[calc(100%-1.5rem)] rounded-lg bg-amber px-3 py-1.5 text-sm font-bold text-navy shadow-sm sm:right-4 sm:top-4 sm:rounded-xl sm:px-4 sm:py-2 sm:text-lg">{score}% <span className="text-xs font-medium sm:text-sm">соответствия</span></span>}
          </div>
          <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-9">
            {reference.sourceBacked && <div className="mb-4 flex flex-wrap gap-2"><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-800">{reference.qualityTier === 'hero' ? 'Hero Reference' : 'Gold Reference'}</span><span className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-sky-800">Source-backed</span></div>}
            <p className="eyebrow">{reference.category}</p>
            <h1 className="mt-3 break-words text-3xl font-bold leading-tight tracking-tight text-navy sm:text-4xl">{reference.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted">{reference.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">{reference.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-muted">{tag}</span>)}</div>
            <BoardButton id={reference.id} className="mt-7 w-full sm:w-auto" />
          </div>
        </div>
      </div>
      {reasons.length > 0 && <section className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-5 sm:p-7"><RecommendationReasons reasons={reasons} /></section>}
      {routeState?.curatedCore && <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="composition-title"><p className="eyebrow">Композиционный принцип</p><h2 id="composition-title" className="mt-2 text-2xl font-semibold text-navy">{reference.compositionFamily}</h2><p className="mt-3 max-w-4xl leading-7 text-muted">{reference.sourceNotes || reference.summary}</p></section>}
      {intelligence && <ReferenceIntelligencePanel intelligence={intelligence} />}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-success"><Icon name="check" className="h-5 w-5" /></span><h2 className="text-xl font-semibold text-navy">Лучше использовать, когда</h2></div><ul className="mt-5 space-y-3 text-muted">{reference.useWhen.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" /><span>{item}</span></li>)}</ul></section>
        <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="warning" className="h-5 w-5" /></span><h2 className="text-xl font-semibold text-navy">Не лучший выбор, когда</h2></div><ul className="mt-5 space-y-3 text-muted">{reference.avoidWhen.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" /><span>{item}</span></li>)}</ul></section>
      </div>
      <div className="surface mt-6 p-3 sm:p-4"><DesignDna values={reference.designDna} /></div>
      {intelligence && isTestMode(location.search) && <IntelligenceFeedbackForm referenceId={reference.id} />}
      <ReferenceFeedbackForm referenceId={reference.id} />
      {linkedSources.length > 0 ? <VerifiedSourcePanel sources={linkedSources} /> : !intelligence && reference.sourceBacked && reference.sourceUrl ? (
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
          <p className="mt-2 text-xs font-medium text-muted">Правовой статус: {reference.rightsStatus}</p>
          {reference.sourceNotes && <p className="mt-3 text-sm leading-6 text-muted">{reference.sourceNotes}</p>}
        </section>
      ) : <p className="mt-5 px-1 text-sm text-muted">Источник: {reference.sourceLabel}</p>}
    </article>
  )
}
