import { useFeedback } from '../hooks/useFeedback'
import type { SourceReference } from '../types/sourceReference'
import { Icon } from './Icon'

const statusLabels = { verified: 'Проверен', source_found: 'Источник найден — проверка продолжается', candidate: 'Кандидат', rejected: 'Отклонён' }

export function VerifiedSourcePanel({ sources }: { sources: SourceReference[] }) {
  const feedback = useFeedback()
  if (!sources.length) return null
  return <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="verified-source-heading">
    <p className="eyebrow">Provenance</p>
    <div className="mt-3 flex flex-col gap-5">
      {sources.map((source, index) => {
        const href = source.directDocumentUrl && source.pageNumber ? `${source.directDocumentUrl}#page=${source.pageNumber}` : source.primaryUrl
        return <article key={source.id} className={index ? 'border-t border-line pt-5' : ''}>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">{source.verificationStatus === 'verified' && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Проверенный источник</span>}<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">{statusLabels[source.verificationStatus]}</span></div>
              <h2 id={index === 0 ? 'verified-source-heading' : undefined} className="mt-3 text-xl font-semibold text-navy">{source.verificationStatus === 'verified' ? 'Проверенный первоисточник' : 'Профессиональный первоисточник'}</h2>
              <p className="mt-2 break-words font-semibold text-navy">{source.presentationTitle}</p>
              <p className="mt-1 break-words text-sm text-muted">{source.organization}{source.pageNumber ? ` · страница ${source.pageNumber}` : ''}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{source.compositionPrinciple}</p>
            </div>
            <a href={href} target="_blank" rel="noreferrer" onClick={() => { if (source.verificationStatus === 'verified') feedback.logEvent('verified_source_opened', source.id) }} className="btn-primary shrink-0">Открыть первоисточник<Icon name="arrow-right" className="h-4 w-4" /></a>
          </div>
          <p className="mt-4 border-t border-line pt-4 text-xs leading-5 text-muted">Режим показа: {source.displayMode}. Внешний visual не хранится в PIP. Правовой статус: {source.rightsStatus}.</p>
        </article>
      })}
    </div>
  </section>
}
