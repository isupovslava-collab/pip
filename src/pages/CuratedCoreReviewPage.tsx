import { useState } from 'react'
import { labels } from '../data/dictionaries'
import { referenceIntelligenceById } from '../data/sourceReferences/reference-intelligence'
import { sourceReferenceById } from '../data/sourceReferences/source-references'
import { createCuratedCoreReviewExport, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH, readCuratedCoreReviewDecisions, writeCuratedCoreReviewDecisions, type CuratedCoreContentTypeDecision, type CuratedCoreReviewDecision } from '../services/curatedCoreReviewStorage'
import { isCuratedCoreEligible } from '../services/selectCuratedCore'
import type { ContentTypeId, PoReviewDisposition, Reference } from '../types/reference'

interface Props { references: Reference[] }
type QuickFilter = 'attention' | 'production' | 'reclassification' | 'revise' | 'pending' | 'archive' | 'all'
const contentTypes = Object.keys(labels.contentType) as ContentTypeId[]
const quickFilters: Array<[QuickFilter, string]> = [['attention', 'Needs PO Attention'], ['production', 'Production'], ['reclassification', 'Reclassification Queue'], ['revise', 'Revise'], ['pending', 'Pending'], ['archive', 'Rejected / Archive'], ['all', 'All']]
const archiveDispositions = new Set<PoReviewDisposition>(['rejected_schematic', 'rejected_quality', 'rejected_wrong_type'])

export function CuratedCoreReviewPage({ references }: Props) {
  const [contentType, setContentType] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('attention')
  const [decisions, setDecisions] = useState<Record<string, CuratedCoreReviewDecision>>(() => readCuratedCoreReviewDecisions())
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [proposals, setProposals] = useState<Record<string, ContentTypeId>>({})

  const dispositionFor = (reference: Reference) => decisions[reference.id]?.poReviewDisposition ?? reference.poReviewDisposition
  const filtered = references.filter((reference) => {
    const disposition = dispositionFor(reference)
    const attention = disposition === 'reclassify' || disposition === 'revise_visual' || disposition === 'pending' && reference.curatedCoreStatus === 'review_only'
    return (!contentType || reference.primaryContentTypeId === contentType) && (
      quickFilter === 'all'
      || quickFilter === 'attention' && attention
      || quickFilter === 'production' && isCuratedCoreEligible(reference)
      || quickFilter === 'reclassification' && disposition === 'reclassify'
      || quickFilter === 'revise' && disposition === 'revise_visual'
      || quickFilter === 'pending' && disposition === 'pending'
      || quickFilter === 'archive' && archiveDispositions.has(disposition)
    )
  })
  const compared = compareIds.flatMap((id) => references.find((reference) => reference.id === id) ?? [])
  const eligible = references.filter(isCuratedCoreEligible).length

  const saveDecision = (reference: Reference, contentTypeDecision: CuratedCoreContentTypeDecision, poReviewDisposition: PoReviewDisposition, proposedContentType?: ContentTypeId, visualDecision: CuratedCoreReviewDecision['visualDecision'] = 'approve') => {
    const previous = decisions[reference.id]
    const next = { ...decisions, [reference.id]: { referenceId: reference.id, visualDecision, contentTypeDecision, poReviewDisposition, currentContentType: reference.primaryContentTypeId, ...(contentTypeDecision === 'verified' ? { verifiedContentType: reference.primaryContentTypeId } : {}), ...(proposedContentType ? { proposedContentType } : {}), notes: previous?.notes ?? reference.poReviewNotes ?? '', round: 'sprint-9-1-manual' as const, reviewedAt: new Date().toISOString() } }
    setDecisions(next)
    writeCuratedCoreReviewDecisions(next)
  }
  const saveNotes = (reference: Reference, notes: string) => {
    const previous = decisions[reference.id]
    const next = { ...decisions, [reference.id]: { referenceId: reference.id, visualDecision: previous?.visualDecision ?? 'approve', contentTypeDecision: previous?.contentTypeDecision ?? reference.contentTypePoVerificationStatus, poReviewDisposition: previous?.poReviewDisposition ?? reference.poReviewDisposition, currentContentType: reference.primaryContentTypeId, ...(previous?.verifiedContentType ? { verifiedContentType: previous.verifiedContentType } : {}), ...(previous?.proposedContentType ? { proposedContentType: previous.proposedContentType } : {}), notes: notes.slice(0, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH), round: previous?.round ?? reference.poReviewRound, reviewedAt: previous?.reviewedAt ?? new Date().toISOString() } }
    setDecisions(next)
    writeCuratedCoreReviewDecisions(next)
  }
  const toggleCompare = (reference: Reference) => setCompareIds((current) => current.includes(reference.id) ? current.filter((id) => id !== reference.id) : current.length < 3 ? [...current, reference.id] : current)
  const exportReview = () => {
    const content = `${JSON.stringify(createCuratedCoreReviewExport(references, decisions), null, 2)}\n`
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'curated-core-po-review.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="mx-auto max-w-7xl" aria-labelledby="curated-review-title">
    <header className="surface p-5 sm:p-8"><p className="eyebrow">Internal · Product Owner Calibration</p><h1 id="curated-review-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Premium Curated Core Review v3</h1><p className="mt-3 max-w-4xl leading-7 text-muted">Production whitelist: <strong className="text-navy">{eligible}</strong> из {references.length}. Rejected schematic archive скрыт по умолчанию. Локальные решения не меняют production-данные.</p><button type="button" onClick={exportReview} className="btn-primary mt-5">Export Review JSON</button></header>
    <section className="surface mt-6 p-5 sm:p-6" aria-label="Фильтры Curated Core"><div className="flex flex-wrap gap-2">{quickFilters.map(([value, label]) => <button key={value} type="button" aria-pressed={quickFilter === value} onClick={() => { setQuickFilter(value); setCompareIds([]) }} className={`min-h-10 rounded-xl border px-3 py-2 text-sm font-semibold ${quickFilter === value ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy'}`}>{label}</button>)}</div>{quickFilter === 'attention' && <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-navy"><strong>Cover Recovery:</strong> 4 отдельных PIP-original candidates ожидают визуального решения. <a href="#/test-cover-recovery-review" className="font-bold text-blue underline underline-offset-2">Открыть отдельную gallery</a></div>}<div className="mt-4 max-w-md"><Filter label="Content type" value={contentType} onChange={(value) => { setContentType(value); setCompareIds([]) }} /></div><p className="mt-4 text-sm text-muted">Показано: <strong className="text-navy">{filtered.length}</strong> · Выбрано для сравнения: <strong className="text-navy">{compareIds.length} / 3</strong></p>{compareIds.length === 3 && <p role="status" className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Можно сравнить максимум 3 варианта. Снимите один выбор, чтобы добавить другой.</p>}</section>
    {compared.length > 0 && <section className="surface mt-6 p-5 sm:p-6" aria-labelledby="compare-title"><div className="flex items-center justify-between gap-3"><h2 id="compare-title" className="text-2xl font-bold text-navy">Candidate Compare Mode</h2><button type="button" onClick={() => setCompareIds([])} className="btn-ghost">Очистить</button></div><div className={`mt-5 grid gap-4 ${compared.length > 1 ? 'md:grid-cols-2' : ''} ${compared.length > 2 ? 'xl:grid-cols-3' : ''}`}>{compared.map((reference) => <article key={reference.id} className="overflow-hidden rounded-2xl border border-line"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Compare preview ${reference.title}`} className="aspect-video w-full bg-slate-100 object-contain" /><div className="p-4"><p className="font-mono text-xs font-bold text-blue">{reference.id}</p><h3 className="mt-2 font-bold text-navy">{reference.title}</h3><p className="mt-2 text-sm text-muted">{labels.contentType[reference.primaryContentTypeId]} · {reference.compositionFamily}</p></div></article>)}</div></section>}
    <div className="mt-6 grid gap-5 xl:grid-cols-2">{filtered.map((reference) => {
      const firstCompared = compared[0]
      const incompatible = Boolean(firstCompared && firstCompared.primaryContentTypeId !== reference.primaryContentTypeId)
      const compareDisabled = !compareIds.includes(reference.id) && (compareIds.length >= 3 || incompatible)
      const proposed = proposals[reference.id] ?? reference.proposedPrimaryContentType ?? contentTypes.find((type) => type !== reference.primaryContentTypeId)!
      return <ReviewCard key={reference.id} reference={reference} decision={decisions[reference.id]} disposition={dispositionFor(reference)} compared={compareIds.includes(reference.id)} compareDisabled={compareDisabled} onCompare={() => toggleCompare(reference)} proposed={proposed} onProposed={(value) => setProposals((current) => ({ ...current, [reference.id]: value }))} onApprove={() => saveDecision(reference, 'verified', 'approved')} onReclassify={() => saveDecision(reference, 'reclassify', 'reclassify', proposed)} onReject={() => saveDecision(reference, 'rejected', 'rejected_quality', undefined, 'reject')} onNotes={(notes) => saveNotes(reference, notes)} />
    })}</div>
  </section>
}

interface ReviewCardProps { reference: Reference; decision?: CuratedCoreReviewDecision; disposition: PoReviewDisposition; compared: boolean; compareDisabled: boolean; onCompare: () => void; proposed: ContentTypeId; onProposed: (value: ContentTypeId) => void; onApprove: () => void; onReclassify: () => void; onReject: () => void; onNotes: (notes: string) => void }
function ReviewCard({ reference, decision, disposition, compared, compareDisabled, onCompare, proposed, onProposed, onApprove, onReclassify, onReject, onNotes }: ReviewCardProps) {
  const sources = (referenceIntelligenceById.get(reference.id)?.sourceReferenceIds ?? []).flatMap((id) => sourceReferenceById.get(id) ?? [])
  const sourceVerification = sources.length ? [...new Set(sources.map(({ sourceVerificationStatus }) => sourceVerificationStatus))].join(', ') : 'not linked'
  const productApproval = sources.length ? [...new Set(sources.map(({ pipProductReviewStatus }) => pipProductReviewStatus))].join(', ') : 'not linked'
  const exposure = isCuratedCoreEligible(reference)
  return <article className="surface overflow-hidden"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Preview ${reference.title}`} className="aspect-video w-full bg-slate-100 object-contain" /><div className="p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge value={reference.id} /><Badge value={reference.visualReferenceQuality} /><Badge value={disposition} /><label className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-navy"><input type="checkbox" aria-label={`Сравнить ${reference.id}`} checked={compared} disabled={compareDisabled} title={compareDisabled ? 'Можно сравнить максимум 3 варианта одного типа' : undefined} onChange={onCompare} />Compare</label></div><h2 className="mt-4 text-xl font-bold text-navy">{reference.title}</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Meta label="Current primary type" value={`${reference.primaryContentTypeId} · ${labels.contentType[reference.primaryContentTypeId]}`} /><Meta label="Proposed type" value={decision?.proposedContentType ?? reference.proposedPrimaryContentType ?? '—'} /><Meta label="PO disposition" value={disposition} /><Meta label="Type PO verification" value={decision?.contentTypeDecision ?? reference.contentTypePoVerificationStatus} /><Meta label="Production exposure" value={exposure ? 'true' : 'false'} /><Meta label="Curated status" value={reference.curatedCoreStatus} /><Meta label="Source type / verification" value={`${reference.sourceType} / ${sourceVerification}`} /><Meta label="PIP product approval" value={productApproval} /><Meta label="Family / direction" value={`${reference.compositionFamily} / ${reference.visualDirection}`} /><Meta label="Scenarios" value={reference.scenarioIds.join(', ')} /><Meta label="Goals" value={reference.goalIds.join(', ')} /><Meta label="Personas / styles" value={`${reference.personaIds.join(', ')} / ${reference.styleIds.join(', ')}`} /></dl><label className="mt-5 block text-sm font-semibold text-navy">Proposed primary content type<select aria-label={`Proposed type ${reference.id}`} value={proposed} onChange={(event) => onProposed(event.target.value as ContentTypeId)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal">{contentTypes.filter((type) => type !== reference.primaryContentTypeId).map((type) => <option key={type} value={type}>{labels.contentType[type]}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-navy">PO notes<textarea aria-label={`PO notes ${reference.id}`} maxLength={CURATED_CORE_REVIEW_NOTES_MAX_LENGTH} value={decision?.notes ?? reference.poReviewNotes ?? ''} onChange={(event) => onNotes(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-line p-3 font-normal" /></label><div className="mt-5 grid gap-2 sm:grid-cols-3"><button type="button" onClick={onApprove} className="btn-secondary px-3">APPROVE TYPE</button><button type="button" onClick={onReclassify} className="btn-secondary px-3">RECLASSIFY</button><button type="button" onClick={onReject} className="min-h-11 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50">REJECT FROM CORE</button></div></div></article>
}

function Filter({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-sm font-semibold text-navy">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"><option value="">Все</option>{contentTypes.map((option) => <option key={option} value={option}>{labels.contentType[option]}</option>)}</select></label> }
function Badge({ value }: { value: string }) { return <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue">{value}</span> }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-semibold text-navy">{value}</dd></div> }
