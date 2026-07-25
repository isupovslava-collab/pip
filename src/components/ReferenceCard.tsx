import { Link } from 'react-router-dom'
import type { RankedReference, Reference } from '../types/reference'
import { BoardButton } from './BoardButton'
import { RecommendationReasons } from './RecommendationReasons'

export function ReferenceCard({ reference }: { reference: Reference | RankedReference }) {
  const ranked = 'score' in reference
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Схематичное превью: ${reference.title}`} className="h-full w-full object-cover" />
        {ranked && <span className="absolute right-3 top-3 rounded-full bg-navy px-3 py-1.5 text-sm font-black text-white">{reference.score}%</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-blue">{reference.category}</p>
        <h2 className="mt-2 text-xl font-bold leading-tight text-navy">{reference.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{reference.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">{reference.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-muted">{tag}</span>)}</div>
        {ranked && <div className="mt-5"><RecommendationReasons reasons={reference.reasons} /></div>}
        <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
          <Link to={`/reference/${reference.id}`} state={ranked ? { score: reference.score, reasons: reference.reasons } : undefined} className="flex min-h-11 items-center justify-center rounded-lg bg-navy px-4 font-bold text-white hover:bg-blue">Подробнее</Link>
          <BoardButton id={reference.id} />
        </div>
      </div>
    </article>
  )
}
