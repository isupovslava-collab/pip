import { Link, useLocation } from 'react-router-dom'
import { labels } from '../data/dictionaries'
import { referenceIntelligenceById } from '../data/sourceReferences/reference-intelligence'
import { sourceReferenceById } from '../data/sourceReferences/source-references'
import { useFeedback } from '../hooks/useFeedback'
import { isProductionEligibleSourceReference } from '../lib/referenceVerification/productApproval'
import type { RankedReference, SearchQuery } from '../types/reference'
import { BoardButton } from './BoardButton'
import { Icon } from './Icon'

export function CuratedCoreSection({ references, query, onOpenFreshDiscovery }: { references: RankedReference[]; query: SearchQuery; onOpenFreshDiscovery: () => void }) {
  if (!references.length) return <section className="surface overflow-hidden p-5 sm:p-7" aria-labelledby="curated-core-title">
    <p className="eyebrow">Premium Curated Core</p><h2 id="curated-core-title" className="mt-2 text-2xl font-bold text-navy">Эталонные варианты PIP</h2>
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"><h3 className="text-xl font-bold text-navy">В библиотеке PIP пока нет эталонного варианта для этого типа слайда.</h3><p className="mt-2 max-w-3xl leading-7 text-muted">Мы не добавляем слабые или формально похожие варианты ради количества. Используйте Fresh Discovery, чтобы найти актуальные профессиональные примеры.</p><p className="mt-3 max-w-3xl font-bold leading-7 text-navy">Свежий поиск доступен сразу — PIP подготовит точный запрос под вашу задачу.</p><button type="button" onClick={onOpenFreshDiscovery} className="btn-primary mt-5"><Icon name="sparkles" className="h-4 w-4" />Найти свежие референсы</button></div>
  </section>

  return <section aria-labelledby="curated-core-title">
    <div className="mb-5"><p className="eyebrow">Premium Curated Core</p><h2 id="curated-core-title" className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Эталонные варианты PIP</h2><p className="mt-2 max-w-3xl leading-7 text-muted">Небольшая подборка сильных решений, точно соответствующих выбранному типу слайда.</p></div>
    <div className={`grid gap-6 ${references.length === 1 ? 'max-w-3xl' : references.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>{references.map((reference) => <CuratedCoreCard key={reference.id} reference={reference} query={query} />)}</div>
    {references.length < 3 && <p className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-semibold leading-6 text-navy">{references.length === 1 ? 'Сейчас в PIP есть один эталонный вариант для этого типа слайда. Для большего выбора используйте Fresh Discovery.' : 'Сейчас в PIP есть два эталонных варианта. Для дополнительных свежих примеров используйте Fresh Discovery.'}</p>}
  </section>
}

function CuratedCoreCard({ reference, query }: { reference: RankedReference; query: SearchQuery }) {
  const location = useLocation()
  const feedback = useFeedback()
  const verified = (referenceIntelligenceById.get(reference.id)?.sourceReferenceIds ?? []).some((id) => {
    const source = sourceReferenceById.get(id)
    return source ? isProductionEligibleSourceReference(source) : false
  })
  return <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift">
    <div className="relative aspect-video overflow-hidden bg-slate-100"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Превью слайда: ${reference.title}`} className="h-full w-full object-contain transition group-hover:scale-[1.01]" /><div className="absolute left-3 top-3 flex flex-wrap gap-2"><span className="rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white">Эталон PIP</span><span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-navy">Точное соответствие</span>{verified && <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900">Проверен источник</span>}</div></div>
    <div className="flex flex-1 flex-col p-5 sm:p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue">{labels.contentType[reference.primaryContentTypeId]} · {reference.compositionFamily}</p><h3 className="mt-2 text-xl font-bold leading-snug text-navy">{reference.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{reference.reasons[1]}</p><div className="mt-auto grid grid-cols-2 gap-2 pt-6"><Link to={{ pathname: `/reference/${reference.id}`, search: location.search }} state={{ score: reference.score, reasons: reference.reasons, curatedCore: true, query }} onClick={() => feedback.logEvent('reference_opened', reference.id)} className="btn-primary px-3">Разобрать слайд<Icon name="arrow-right" className="h-4 w-4" /></Link><BoardButton id={reference.id} addLabel="Добавить в идеи" /></div></div>
  </article>
}
