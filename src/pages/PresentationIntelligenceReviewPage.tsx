import { useMemo, useState } from 'react'
import { contentTypes, labels } from '../data/dictionaries'
import { presentationIntelligenceById, presentationIntelligenceV1 } from '../data/referenceIntelligence'
import { isCuratedCoreEligible } from '../services/selectCuratedCore'
import { createPresentationIntelligenceReviewExport, INTELLIGENCE_REVIEW_NOTES_MAX_LENGTH, readPresentationIntelligenceReviews, writePresentationIntelligenceReviews, type IntelligenceReviewRecord, type IntelligenceReviewStatus } from '../services/presentationIntelligenceReviewStorage'
import type { ContentTypeId, Reference } from '../types/reference'
import type { ReferenceIntelligenceV1 } from '../types/presentationIntelligence'

type ScopeFilter = 'all' | 'needs_review'

export function PresentationIntelligenceReviewPage({ references }: { references: Reference[] }) {
  const production = useMemo(() => references.filter(isCuratedCoreEligible).flatMap((reference) => {
    const intelligence = presentationIntelligenceById.get(reference.id)
    return intelligence ? [{ reference, intelligence }] : []
  }), [references])
  const [contentType, setContentType] = useState<'all' | ContentTypeId>('all')
  const [referenceId, setReferenceId] = useState('all')
  const [scope, setScope] = useState<ScopeFilter>('all')
  const [reviews, setReviews] = useState<Record<string, IntelligenceReviewRecord>>(() => readPresentationIntelligenceReviews())
  const [currentId, setCurrentId] = useState(production[0]?.reference.id ?? '')

  const filtered = production.filter(({ reference }) => (contentType === 'all' || reference.primaryContentTypeId === contentType)
    && (referenceId === 'all' || reference.id === referenceId)
    && (scope === 'all' || reviews[reference.id]?.intelligenceStatus !== 'approve'))
  const current = filtered.find(({ reference }) => reference.id === currentId) ?? filtered[0]
  const currentIndex = current ? filtered.findIndex(({ reference }) => reference.id === current.reference.id) : -1

  const updateReview = (id: string, change: Partial<IntelligenceReviewRecord>) => {
    const next = {
      ...reviews,
      [id]: { referenceId: id, intelligenceStatus: reviews[id]?.intelligenceStatus ?? '', poNotes: reviews[id]?.poNotes ?? '', timestamp: new Date().toISOString(), ...change },
    }
    setReviews(next)
    writePresentationIntelligenceReviews(next)
  }

  const exportReview = () => {
    const json = `${JSON.stringify(createPresentationIntelligenceReviewExport(presentationIntelligenceV1, reviews), null, 2)}\n`
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'presentation-intelligence-po-review.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="mx-auto max-w-7xl" aria-labelledby="intelligence-review-title">
    <header className="surface p-5 sm:p-8"><p className="eyebrow">Internal · Product Owner Review</p><h1 id="intelligence-review-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Presentation Intelligence V1 Review</h1><p className="mt-3 max-w-4xl leading-7 text-muted">{production.length} production references доступны для проверки Intelligence. Локальные статусы не меняют approval, ranking или production eligibility.</p><button type="button" onClick={exportReview} className="btn-primary mt-5">Export PO Review JSON</button></header>

    <section className="surface mt-6 p-5 sm:p-6" aria-label="Intelligence review filters"><div className="grid gap-4 md:grid-cols-3"><FilterSelect label="Content Type" value={contentType} onChange={(value) => { setContentType(value as typeof contentType); setCurrentId('') }} options={[['all', 'Все'], ...contentTypes.map(({ id, label }) => [id, label] as [string, string])]} /><FilterSelect label="Reference ID" value={referenceId} onChange={(value) => { setReferenceId(value); setCurrentId(value === 'all' ? '' : value) }} options={[['all', 'Все'], ...production.map(({ reference }) => [reference.id, `${reference.id} · ${reference.title}`] as [string, string])]} /><FilterSelect label="Review Scope" value={scope} onChange={(value) => { setScope(value as ScopeFilter); setCurrentId('') }} options={[['all', 'All'], ['needs_review', 'Needs Review']]} /></div><p className="mt-4 text-sm font-semibold text-muted">Показано: <strong className="text-navy">{filtered.length}</strong> · Текущий: <strong className="text-navy">{currentIndex >= 0 ? currentIndex + 1 : 0} / {filtered.length}</strong></p></section>

    {!current ? <div className="surface mt-6 p-8 text-center"><h2 className="text-xl font-bold text-navy">Нет записей для выбранного фильтра</h2><p className="mt-2 text-muted">Измените Content Type, Reference ID или Review Scope.</p></div> : <ReviewCard key={current.reference.id} reference={current.reference} intelligence={current.intelligence} review={reviews[current.reference.id]} onChange={(change) => updateReview(current.reference.id, change)} onPrevious={() => setCurrentId(filtered[Math.max(0, currentIndex - 1)].reference.id)} onNext={() => setCurrentId(filtered[Math.min(filtered.length - 1, currentIndex + 1)].reference.id)} previousDisabled={currentIndex <= 0} nextDisabled={currentIndex >= filtered.length - 1} />}
  </section>
}

function ReviewCard({ reference, intelligence, review, onChange, onPrevious, onNext, previousDisabled, nextDisabled }: { reference: Reference; intelligence: ReferenceIntelligenceV1; review?: IntelligenceReviewRecord; onChange: (change: Partial<IntelligenceReviewRecord>) => void; onPrevious: () => void; onNext: () => void; previousDisabled: boolean; nextDisabled: boolean }) {
  return <article className="surface mt-6 overflow-hidden"><div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]"><div className="bg-slate-100 p-3"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Intelligence review preview ${reference.id}: ${reference.title}`} className="aspect-video h-auto w-full object-contain" /></div><div className="p-5 sm:p-7"><div className="flex flex-wrap gap-2"><Badge>{reference.id}</Badge><Badge>{labels.contentType[reference.primaryContentTypeId]}</Badge><Badge>production approved</Badge></div><h2 className="mt-4 text-2xl font-bold text-navy">{reference.title}</h2><p className="mt-4 text-xs font-bold uppercase tracking-wide text-blue">Визуальный принцип</p><p className="mt-2 text-lg font-semibold leading-7 text-navy">{intelligence.visualPrinciple}</p><div className="mt-6 flex gap-3"><button type="button" disabled={previousDisabled} onClick={onPrevious} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40">← Previous</button><button type="button" disabled={nextDisabled} onClick={onNext} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40">Next →</button></div></div></div>
    <div className="grid gap-5 border-t border-line p-5 sm:p-7 xl:grid-cols-2"><ReviewSection title="Why It Works" items={intelligence.whyItWorks.map(({ title, explanation }) => `${title}: ${explanation}`)} /><ReviewSection title="Anatomy" items={intelligence.anatomy.map(({ label, purpose, priority }) => `${label} [${priority}]: ${purpose}`)} /><ReviewSection title="Mapping" items={intelligence.contentMapping.map(({ slot, replaceWith }) => `${slot} → ${replaceWith}`)} /><ReviewSection title="Preserve / Replace / Avoid" items={[...intelligence.adaptation.preserve.map((item) => `PRESERVE — ${item}`), ...intelligence.adaptation.replace.map((item) => `REPLACE — ${item}`), ...intelligence.adaptation.avoid.map((item) => `AVOID — ${item}`)]} /><ReviewSection title="Best For" items={[...intelligence.bestFor, ...(intelligence.lessSuitableFor ?? []).map((item) => `LESS SUITABLE — ${item}`)]} /><ReviewSection title="Design Brief" items={[`Layout: ${intelligence.designBrief.layout}`, `Emphasis: ${intelligence.designBrief.emphasis}`, `Visual Mood: ${intelligence.designBrief.visualMood}`, `Content Logic: ${intelligence.designBrief.contentLogic}`, ...intelligence.designBrief.constraints.map((item) => `Constraint: ${item}`)]} /></div>
    <div className="grid gap-4 border-t border-line bg-slate-50 p-5 sm:p-7 md:grid-cols-[minmax(220px,0.35fr)_minmax(0,1fr)]"><label className="text-sm font-semibold text-navy">Intelligence PO status<select aria-label={`Intelligence PO status ${reference.id}`} value={review?.intelligenceStatus ?? ''} onChange={(event) => onChange({ intelligenceStatus: event.target.value as IntelligenceReviewStatus })} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"><option value="">—</option><option value="approve">APPROVE</option><option value="revise">REVISE</option><option value="reject">REJECT</option></select></label><label className="text-sm font-semibold text-navy">PO Notes<textarea aria-label={`Intelligence PO notes ${reference.id}`} value={review?.poNotes ?? ''} maxLength={INTELLIGENCE_REVIEW_NOTES_MAX_LENGTH} onChange={(event) => onChange({ poNotes: event.target.value.slice(0, INTELLIGENCE_REVIEW_NOTES_MAX_LENGTH) })} className="mt-2 min-h-28 w-full rounded-xl border border-line bg-white p-3 font-normal" /></label></div>
  </article>
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) { return <label className="text-sm font-semibold text-navy">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal">{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label> }
function Badge({ children }: { children: string }) { return <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue">{children}</span> }
function ReviewSection({ title, items }: { title: string; items: string[] }) { return <section className="rounded-2xl border border-line bg-white p-5"><h3 className="text-lg font-bold text-navy">{title}</h3><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 text-muted"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" /><span>{item}</span></li>)}</ul></section> }
