import { Link } from 'react-router-dom'
import type { RankedReference, Reference } from '../types/reference'
import { BoardButton } from './BoardButton'
import { Icon } from './Icon'
import { RecommendationReasons } from './RecommendationReasons'

export function ReferenceCard({ reference, rank }: { reference: Reference | RankedReference; rank?: number }) {
  const ranked = 'score' in reference
  const rankLabel = rank === 1 ? 'Лучшее совпадение' : rank && rank <= 3 ? `В топ-${rank}` : null
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lift ${rank === 1 ? 'border-2 border-sky-300 shadow-lift' : 'border border-line shadow-card'}`}>
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Схематичное превью: ${reference.title}`} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.015]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          {rankLabel ? <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${rank === 1 ? 'bg-navy text-white' : 'bg-white/95 text-navy'}`}><Icon name="sparkles" className={`h-3.5 w-3.5 ${rank === 1 ? 'text-bright' : 'text-blue'}`} />{rankLabel}</span> : <span />}
          {ranked && <span className="rounded-xl bg-amber px-3 py-2 text-lg font-bold leading-none text-navy shadow-sm" aria-label={`Соответствие: ${reference.score}%`}>{reference.score}%</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue">{reference.category}</p>
        <h2 className="mt-2 text-xl font-semibold leading-snug tracking-tight text-navy">{reference.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{reference.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">{reference.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-muted">{tag}</span>)}</div>
        {ranked && <div className="mt-5 border-t border-line/70 pt-5"><RecommendationReasons reasons={reference.reasons} /></div>}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
          <Link to={`/reference/${reference.id}`} state={ranked ? { score: reference.score, reasons: reference.reasons } : undefined} className="btn-primary px-3">Подробнее<Icon name="arrow-right" className="h-4 w-4" /></Link>
          <BoardButton id={reference.id} />
        </div>
      </div>
    </article>
  )
}
