import { useMemo, useState } from 'react'
import { labels } from '../data/dictionaries'
import { referenceIntelligenceById } from '../data/sourceReferences/reference-intelligence'
import { sourceReferenceById } from '../data/sourceReferences/source-references'
import { createCuratedCoreReviewExport, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH, readCuratedCoreReviewDecisions, writeCuratedCoreReviewDecisions, type CuratedCoreContentTypeDecision, type CuratedCoreReviewDecision } from '../services/curatedCoreReviewStorage'
import { isCuratedCoreEligible } from '../services/selectCuratedCore'
import type { ContentTypeId, Reference } from '../types/reference'

interface Props { references: Reference[] }
type QuickFilter = 'all' | 'premium' | 'pending' | 'verified' | 'reclassify' | 'rejected' | 'production_eligible'
const contentTypes = Object.keys(labels.contentType) as ContentTypeId[]
const quickFilters: Array<[QuickFilter, string]> = [['all', 'All'], ['premium', 'Premium'], ['pending', 'Pending type review'], ['verified', 'Verified'], ['reclassify', 'Reclassify'], ['rejected', 'Rejected'], ['production_eligible', 'Production eligible']]

export function CuratedCoreReviewPage({ references }: Props) {
  const [contentType, setContentType] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [decisions, setDecisions] = useState<Record<string, CuratedCoreReviewDecision>>(() => readCuratedCoreReviewDecisions())
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [proposals, setProposals] = useState<Record<string, ContentTypeId>>({})

  const filtered = useMemo(() => references.filter((reference) => {
    const status = decisions[reference.id]?.contentTypeDecision ?? reference.contentTypePoVerificationStatus
    return (!contentType || reference.primaryContentTypeId === contentType)
      && (quickFilter === 'all'
        || quickFilter === 'premium' && reference.visualReferenceQuality === 'premium'
        || quickFilter === 'pending' && status === 'pending'
        || quickFilter === 'verified' && status === 'verified'
        || quickFilter === 'reclassify' && status === 'reclassify'
        || quickFilter === 'rejected' && status === 'rejected'
        || quickFilter === 'production_eligible' && isCuratedCoreEligible(reference))
  }), [contentType, quickFilter, references, decisions])
  const compared = compareIds.flatMap((id) => references.find((reference) => reference.id === id) ?? [])
  const eligible = references.filter(isCuratedCoreEligible).length

  const saveDecision = (reference: Reference, contentTypeDecision: CuratedCoreContentTypeDecision, proposedContentType?: ContentTypeId, visualDecision: CuratedCoreReviewDecision['visualDecision'] = 'approve') => {
    const previous = decisions[reference.id]
    const next = { ...decisions, [reference.id]: { referenceId: reference.id, visualDecision, contentTypeDecision, currentContentType: reference.primaryContentTypeId, ...(proposedContentType ? { proposedContentType } : {}), notes: previous?.notes ?? reference.contentTypePoNotes ?? '', reviewedAt: new Date().toISOString() } }
    setDecisions(next)
    writeCuratedCoreReviewDecisions(next)
  }
  const saveNotes = (reference: Reference, notes: string) => {
    const previous = decisions[reference.id]
    const sourceDecision = reference.contentTypePoVerificationStatus
    const contentTypeDecision: CuratedCoreContentTypeDecision = previous?.contentTypeDecision ?? sourceDecision
    const next = { ...decisions, [reference.id]: { referenceId: reference.id, visualDecision: previous?.visualDecision ?? 'approve', contentTypeDecision, currentContentType: reference.primaryContentTypeId, ...(previous?.proposedContentType ? { proposedContentType: previous.proposedContentType } : {}), notes: notes.slice(0, CURATED_CORE_REVIEW_NOTES_MAX_LENGTH), reviewedAt: previous?.reviewedAt ?? new Date().toISOString() } }
    setDecisions(next)
    writeCuratedCoreReviewDecisions(next)
  }
  const toggleCompare = (reference: Reference) => setCompareIds((current) => current.includes(reference.id) ? current.filter((id) => id !== reference.id) : [...current, reference.id].slice(0, 3))
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
    <header className="surface p-5 sm:p-8"><p className="eyebrow">Internal · Product Owner Calibration</p><h1 id="curated-review-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Premium Curated Core Review v2</h1><p className="mt-3 max-w-4xl leading-7 text-muted">Из {references.length} физических референсов production gate проходят <strong className="text-navy">{eligible}</strong>. Локальные решения не меняют production-данные до применения через auditable source map.</p><button type="button" onClick={exportReview} className="btn-primary mt-5">Export Review JSON</button></header>

    <section className="surface mt-6 p-5 sm:p-6" aria-label="Фильтры Curated Core"><div className="flex flex-wrap gap-2">{quickFilters.map(([value, label]) => <button key={value} type="button" aria-pressed={quickFilter === value} onClick={() => setQuickFilter(value)} className={`min-h-10 rounded-xl border px-3 py-2 text-sm font-semibold ${quickFilter === value ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy'}`}>{label}</button>)}</div><div className="mt-4 max-w-md"><Filter label="Content type" value={contentType} onChange={(value) => { setContentType(value); setCompareIds([]) }} options={contentTypes} format={(value) => labels.contentType[value as ContentTypeId]} /></div><p className="mt-4 text-sm text-muted">Показано: <strong className="text-navy">{filtered.length}</strong> · Выбрано для сравнения: <strong className="text-navy">{compareIds.length} / 3</strong></p></section>

    {compared.length > 0 && <section className="surface mt-6 p-5 sm:p-6" aria-labelledby="compare-title"><div className="flex items-center justify-between gap-3"><h2 id="compare-title" className="text-2xl font-bold text-navy">Candidate Compare Mode</h2><button type="button" onClick={() => setCompareIds([])} className="btn-ghost">Очистить</button></div><div className={`mt-5 grid gap-4 ${compared.length > 1 ? 'md:grid-cols-2' : ''} ${compared.length > 2 ? 'xl:grid-cols-3' : ''}`}>{compared.map((reference) => <article key={reference.id} className="overflow-hidden rounded-2xl border border-line"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Compare preview ${reference.title}`} className="aspect-video w-full bg-slate-100 object-contain" /><div className="p-4"><p className="font-mono text-xs font-bold text-blue">{reference.id}</p><h3 className="mt-2 font-bold text-navy">{reference.title}</h3><p className="mt-2 text-sm text-muted">{labels.contentType[reference.primaryContentTypeId]} · {reference.compositionFamily}</p></div></article>)}</div></section>}

    <div className="mt-6 grid gap-5 xl:grid-cols-2">{filtered.map((reference) => {
      const firstCompared = compared[0]
      const incompatibleCompare = Boolean(firstCompared && firstCompared.primaryContentTypeId !== reference.primaryContentTypeId)
      const compareDisabled = !compareIds.includes(reference.id) && (compareIds.length >= 3 || incompatibleCompare)
      const proposed = proposals[reference.id] ?? reference.proposedPrimaryContentType ?? contentTypes.find((type) => type !== reference.primaryContentTypeId)!
      return <ReviewCard key={reference.id} reference={reference} effectiveStatus={decisions[reference.id]?.contentTypeDecision ?? reference.contentTypePoVerificationStatus} decision={decisions[reference.id]} compared={compareIds.includes(reference.id)} compareDisabled={compareDisabled} onCompare={() => toggleCompare(reference)} proposed={proposed} onProposed={(value) => setProposals((current) => ({ ...current, [reference.id]: value }))} onApprove={() => saveDecision(reference, 'verified')} onReclassify={() => saveDecision(reference, 'reclassify', proposed)} onReject={() => saveDecision(reference, 'rejected', undefined, 'reject')} onNotes={(notes) => saveNotes(reference, notes)} />
    })}</div>
  </section>
}

interface ReviewCardProps { reference: Reference; effectiveStatus: string; decision?: CuratedCoreReviewDecision; compared: boolean; compareDisabled: boolean; onCompare: () => void; proposed: ContentTypeId; onProposed: (value: ContentTypeId) => void; onApprove: () => void; onReclassify: () => void; onReject: () => void; onNotes: (notes: string) => void }
function ReviewCard({ reference, effectiveStatus, decision, compared, compareDisabled, onCompare, proposed, onProposed, onApprove, onReclassify, onReject, onNotes }: ReviewCardProps) {
  const sources = (referenceIntelligenceById.get(reference.id)?.sourceReferenceIds ?? []).flatMap((id) => sourceReferenceById.get(id) ?? [])
  const sourceVerification = sources.length ? [...new Set(sources.map(({ sourceVerificationStatus }) => sourceVerificationStatus))].join(', ') : 'not linked'
  const productApproval = sources.length ? [...new Set(sources.map(({ pipProductReviewStatus }) => pipProductReviewStatus))].join(', ') : 'not linked'
  return <article className="surface overflow-hidden"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Preview ${reference.title}`} className="aspect-video w-full bg-slate-100 object-contain" /><div className="p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge value={reference.id} /><Badge value={reference.visualReferenceQuality} /><Badge value={effectiveStatus} /><label className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-navy"><input type="checkbox" aria-label={`Сравнить ${reference.id}`} checked={compared} disabled={compareDisabled} onChange={onCompare} />Compare</label></div><h2 className="mt-4 text-xl font-bold text-navy">{reference.title}</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Meta label="Current primary type" value={`${reference.primaryContentTypeId} · ${labels.contentType[reference.primaryContentTypeId]}`} /><Meta label="Proposed type" value={decision?.proposedContentType ?? reference.proposedPrimaryContentType ?? '—'} /><Meta label="Curated status" value={reference.curatedCoreStatus} /><Meta label="Type PO verification" value={effectiveStatus} /><Meta label="Source type" value={reference.sourceType} /><Meta label="Source verification" value={sourceVerification} /><Meta label="PIP product approval" value={productApproval} /><Meta label="Reference production approval" value={reference.productionApproved ? 'yes' : 'no'} /><Meta label="Family / direction" value={`${reference.compositionFamily} / ${reference.visualDirection}`} /><Meta label="Scenarios" value={reference.scenarioIds.join(', ')} /><Meta label="Goals" value={reference.goalIds.join(', ')} /><Meta label="Personas" value={reference.personaIds.join(', ')} /><Meta label="Styles" value={reference.styleIds.join(', ')} /></dl><label className="mt-5 block text-sm font-semibold text-navy">Proposed primary content type<select aria-label={`Proposed type ${reference.id}`} value={proposed} onChange={(event) => onProposed(event.target.value as ContentTypeId)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal">{contentTypes.filter((type) => type !== reference.primaryContentTypeId).map((type) => <option key={type} value={type}>{labels.contentType[type]}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-navy">PO notes<textarea aria-label={`PO notes ${reference.id}`} maxLength={CURATED_CORE_REVIEW_NOTES_MAX_LENGTH} value={decision?.notes ?? reference.contentTypePoNotes ?? ''} onChange={(event) => onNotes(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-line p-3 font-normal" /></label><div className="mt-5 grid gap-2 sm:grid-cols-3"><button type="button" onClick={onApprove} className="btn-secondary px-3">APPROVE TYPE</button><button type="button" onClick={onReclassify} className="btn-secondary px-3">RECLASSIFY</button><button type="button" onClick={onReject} className="min-h-11 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50">REJECT FROM CORE</button></div></div></article>
}

function Filter({ label, value, onChange, options, format = (item) => item }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; format?: (value: string) => string }) { return <label className="text-sm font-semibold text-navy">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"><option value="">Все</option>{options.map((option) => <option key={option} value={option}>{format(option)}</option>)}</select></label> }
function Badge({ value }: { value: string }) { return <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue">{value}</span> }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-semibold text-navy">{value}</dd></div> }
