import { useEffect, useRef } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import type { ReferenceIntelligence } from '../types/sourceReference'
import { Icon } from './Icon'

const roleLabels: Record<ReferenceIntelligence['dataMappingGuide'][number]['inputRole'], string> = {
  headline: 'Ваш главный вывод', primary_metric: 'Главный показатель', secondary_metrics: 'Подтверждающие показатели', comparison_items: 'Варианты для сравнения', timeline_steps: 'Этапы и сроки', process_steps: 'Шаги процесса', evidence: 'Доказательства', conclusion: 'Управленческий вывод', call_to_action: 'Следующий шаг', other: 'Дополнительные данные',
}

export function ReferenceIntelligencePanel({ intelligence }: { intelligence: ReferenceIntelligence }) {
  const feedback = useFeedback()
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    feedback.logEvent('reference_intelligence_opened', intelligence.referenceId)
    feedback.logEvent('data_mapping_viewed', intelligence.referenceId)
  // Events are deliberately tied to one mounted detail view, not provider rerenders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intelligence.referenceId])

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-sky-50/60 to-indigo-50/60 shadow-card" aria-labelledby="intelligence-title">
      <div className="border-b border-sky-100 p-5 sm:p-8">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-white"><Icon name="sparkles" className="h-5 w-5" /></span><p className="eyebrow">Presentation Intelligence · Pilot</p></div>
        <h2 id="intelligence-title" className="mt-4 text-2xl font-bold tracking-tight text-navy sm:text-3xl">Почему этот дизайн работает</h2>
        <p className="mt-2 max-w-3xl leading-7 text-muted">Разберём композицию на понятные принципы, которые можно использовать в своём слайде.</p>
        <p className="mt-4 max-w-4xl rounded-xl border border-white bg-white/80 px-4 py-3 font-semibold leading-6 text-navy">{intelligence.compositionPrinciple}</p>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-8">
        {intelligence.whyItWorks.map((item, index) => <article key={item.title} className="rounded-2xl border border-white bg-white p-5 shadow-sm"><span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-sm font-bold text-blue">{index + 1}</span><h3 className="mt-4 text-lg font-semibold text-navy">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{item.explanation}</p></article>)}
      </div>

      <div className="grid gap-5 border-t border-sky-100 p-5 sm:p-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-navy p-5 text-white sm:p-6"><h3 className="text-lg font-semibold">Порядок чтения</h3><ol className="mt-4 space-y-3">{intelligence.visualHierarchy.map((item, index) => <li key={item} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-bold">{index + 1}</span><span className="pt-1 text-sm leading-5 text-sky-50">{item}</span></li>)}</ol></div>
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6"><h3 className="text-lg font-semibold text-navy">Типографика</h3><ul className="mt-4 space-y-3">{intelligence.typographyGuidance.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-muted"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-success" /><span>{item}</span></li>)}</ul></div>
      </div>

      <div className="border-t border-sky-100 bg-white p-5 sm:p-8" aria-labelledby="mapping-title">
        <h2 id="mapping-title" className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">Как применить эту композицию к своим данным</h2>
        <p className="mt-2 max-w-3xl leading-7 text-muted">Используйте схему как ориентир — не копируйте исходный слайд буквально.</p>
        <div className="mt-6 space-y-3">{intelligence.dataMappingGuide.map((item) => <article key={`${item.inputRole}-${item.placement}`} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 sm:grid-cols-[minmax(150px,0.7fr)_auto_minmax(0,1.5fr)] sm:items-center sm:p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-blue">{roleLabels[item.inputRole]}</p><p className="mt-1 font-semibold text-navy">{item.placement}</p></div><Icon name="arrow-right" className="hidden h-5 w-5 text-bright sm:block" /><p className="text-sm leading-6 text-muted">{item.guidance}</p></article>)}</div>
      </div>

      <div className="grid gap-4 border-t border-line bg-slate-50 p-5 sm:p-8 lg:grid-cols-3">
        <GuidanceList title="Лучше всего подходит" items={intelligence.bestFor} tone="success" />
        <GuidanceList title="Не использовать, если" items={intelligence.avoidWhen} tone="warning" />
        <GuidanceList title="Не копировать буквально" items={intelligence.doNotCopy} tone="warning" />
      </div>
    </section>
  )
}

function GuidanceList({ title, items, tone }: { title: string; items: string[]; tone: 'success' | 'warning' }) {
  return <section className="rounded-2xl border border-white bg-white p-5"><h3 className="font-semibold text-navy">{title}</h3><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-sm leading-5 text-muted"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'success' ? 'bg-success' : 'bg-amber'}`} /><span>{item}</span></li>)}</ul></section>
}
