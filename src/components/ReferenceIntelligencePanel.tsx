import { useEffect, useMemo, useRef, useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import { composeDesignBrief } from '../services/composeDesignBrief'
import type { Reference, SearchQuery } from '../types/reference'
import type { ReferenceIntelligenceV1 } from '../types/presentationIntelligence'
import { copyTextToClipboard } from '../utils/clipboard'
import { Icon } from './Icon'

const priorityLabels = { primary: 'Главное', secondary: 'Второй уровень', supporting: 'Поддержка' }

export function ReferenceIntelligencePanel({ intelligence, reference, query }: { intelligence: ReferenceIntelligenceV1; reference: Reference; query?: SearchQuery | null }) {
  const feedback = useFeedback()
  const tracked = useRef(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const activeQuery = query ?? feedback.activeSession?.query ?? null
  const brief = useMemo(() => composeDesignBrief(reference, intelligence, activeQuery), [activeQuery, intelligence, reference])

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    feedback.logEvent('reference_intelligence_opened', intelligence.referenceId)
    feedback.logEvent('reference_intelligence_viewed', intelligence.referenceId)
    feedback.logEvent('intelligence_section_opened', intelligence.referenceId)
  // Analytics events belong to one mounted reference view, not provider rerenders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intelligence.referenceId])

  const copyBrief = async () => {
    try {
      await copyTextToClipboard(brief)
      setCopyState('copied')
      feedback.logEvent('design_brief_copied', intelligence.referenceId)
    } catch {
      setCopyState('error')
    }
  }

  return <section className="mt-6 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card" aria-labelledby="intelligence-title">
    <header className="bg-gradient-to-br from-navy via-slate-900 to-blue p-5 text-white sm:p-8">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Icon name="sparkles" className="h-5 w-5" /></span><p className="text-sm font-semibold uppercase tracking-[0.17em] text-sky-200">Presentation Intelligence V1</p></div>
      <h2 id="intelligence-title" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Почему этот слайд работает</h2>
      <p className="mt-2 max-w-3xl leading-7 text-sky-100">Разберите конкретную композицию и перенесите её логику на свою задачу — без буквального копирования исходного слайда.</p>
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5"><p className="text-xs font-bold uppercase tracking-[0.15em] text-sky-200">Визуальный принцип</p><p className="mt-2 text-lg font-semibold leading-7 sm:text-xl">{intelligence.visualPrinciple}</p></div>
    </header>

    <section className="p-5 sm:p-8" aria-labelledby="why-title"><h3 id="why-title" className="text-2xl font-bold text-navy">Почему это работает</h3><div className="mt-5 grid gap-4 md:grid-cols-2">{intelligence.whyItWorks.map((item, index) => <article key={item.title} className="rounded-2xl border border-line bg-slate-50 p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-sm font-bold text-blue">{index + 1}</span><h4 className="mt-4 text-lg font-semibold text-navy">{item.title}</h4><p className="mt-2 text-sm leading-6 text-muted">{item.explanation}</p></article>)}</div></section>

    <section className="border-t border-line bg-slate-50 p-5 sm:p-8" aria-labelledby="anatomy-title"><h3 id="anatomy-title" className="text-2xl font-bold text-navy">Анатомия слайда</h3><p className="mt-2 max-w-3xl leading-7 text-muted">Смысловые зоны и роль каждой части в композиции.</p><ol className="mt-5 grid gap-3 lg:grid-cols-2">{intelligence.anatomy.map((item, index) => <li key={`${item.role}-${item.label}`} className="rounded-2xl border border-line bg-white p-4"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-navy text-sm font-bold text-white">{index + 1}</span><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-navy">{item.label}</h4><span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-blue">{priorityLabels[item.priority]}</span></div><p className="mt-2 text-sm leading-6 text-muted">{item.purpose}</p></div></div></li>)}</ol></section>

    <section className="grid gap-5 border-t border-line p-5 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="hierarchy-title"><div className="rounded-2xl bg-navy p-5 text-white sm:p-6"><h3 id="hierarchy-title" className="text-xl font-bold">Что заметит зритель</h3><dl className="mt-5 space-y-4"><Hierarchy label="Сначала" value={intelligence.hierarchy.primary} /><Hierarchy label="Затем" value={intelligence.hierarchy.secondary} /></dl></div><div className="rounded-2xl border border-line bg-white p-5 sm:p-6"><h4 className="text-lg font-semibold text-navy">Что поддерживает вывод</h4><ul className="mt-4 space-y-3">{intelligence.hierarchy.supporting.map((item) => <ListItem key={item} text={item} tone="blue" />)}</ul></div></section>

    <section className="border-t border-line bg-white p-5 sm:p-8" aria-labelledby="mapping-title"><h3 id="mapping-title" className="text-2xl font-bold text-navy">Что заменить своими данными</h3><p className="mt-2 max-w-3xl leading-7 text-muted">Каждый слот описан простым языком: какую функцию он выполняет и что поставить вместо текущего содержания.</p><div className="mt-5 space-y-3">{intelligence.contentMapping.map((item) => <article key={item.slot} className="grid gap-3 rounded-2xl border border-line bg-slate-50 p-4 md:grid-cols-[minmax(150px,0.65fr)_minmax(180px,0.85fr)_minmax(0,1.4fr)] md:items-center"><div><p className="text-xs font-bold uppercase tracking-wide text-blue">{item.slot}</p>{!item.required && <span className="mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-muted">Необязательно</span>}</div><p className="text-sm font-semibold leading-6 text-navy">{item.currentRole}</p><p className="text-sm leading-6 text-muted">{item.replaceWith}</p></article>)}</div></section>

    <section className="grid gap-4 border-t border-line bg-slate-50 p-5 sm:p-8 lg:grid-cols-3" aria-labelledby="adaptation-title"><h3 id="adaptation-title" className="sr-only">Как перенести на свою задачу</h3><Guidance title="Что сохранить" items={intelligence.adaptation.preserve} tone="success" /><Guidance title="Что заменить" items={intelligence.adaptation.replace} tone="blue" /><Guidance title="Чего избегать" items={intelligence.adaptation.avoid} tone="warning" /></section>

    <section className="grid gap-5 border-t border-line p-5 sm:p-8 lg:grid-cols-2"><Guidance title="Где этот подход особенно полезен" items={intelligence.bestFor} tone="success" /><Guidance title="Где подойдёт хуже" items={intelligence.lessSuitableFor ?? []} tone="warning" /></section>

    <section className="border-t border-sky-100 bg-sky-50 p-5 sm:p-8" aria-labelledby="brief-title"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="eyebrow">Готово к передаче дизайнеру или AI</p><h3 id="brief-title" className="mt-2 text-2xl font-bold text-navy">Дизайн-бриф</h3><p className="mt-2 max-w-3xl leading-7 text-muted">Бриф учитывает сохранённый контекст мастера, если вы пришли из результатов подбора.</p></div><button type="button" onClick={copyBrief} className="btn-primary shrink-0"><Icon name="copy" className="h-4 w-4" />Скопировать дизайн-бриф</button></div><div className="mt-5 rounded-2xl border border-white bg-white p-5 shadow-sm"><pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-navy">{brief}</pre></div><p role="status" aria-live="polite" className={`mt-3 min-h-6 text-sm font-semibold ${copyState === 'error' ? 'text-red-700' : 'text-success'}`}>{copyState === 'copied' ? '✓ Дизайн-бриф скопирован' : copyState === 'error' ? 'Не удалось скопировать. Выделите текст брифа вручную.' : ''}</p><p className="mt-3 text-sm leading-6 text-muted">PIP переносит композиционный принцип, информационную иерархию и визуальную логику. Не копируйте конкретные данные, брендинг, логотипы, изображения или точную раскладку исходного референса.</p></section>
  </section>
}

function Hierarchy({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-sky-300">{label}</dt><dd className="mt-1 text-sm leading-6 text-white">{value}</dd></div> }
function ListItem({ text, tone }: { text: string; tone: 'success' | 'blue' | 'warning' }) { return <li className="flex gap-3 text-sm leading-6 text-muted"><span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'success' ? 'bg-success' : tone === 'blue' ? 'bg-blue' : 'bg-amber'}`} /><span>{text}</span></li> }
function Guidance({ title, items, tone }: { title: string; items: string[]; tone: 'success' | 'blue' | 'warning' }) { return <article className="rounded-2xl border border-white bg-white p-5"><h4 className="text-lg font-semibold text-navy">{title}</h4><ul className="mt-4 space-y-3">{items.map((item) => <ListItem key={item} text={item} tone={tone} />)}</ul></article> }
