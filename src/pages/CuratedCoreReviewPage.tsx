import { useMemo, useState } from 'react'
import { labels } from '../data/dictionaries'
import { referenceIntelligenceById } from '../data/sourceReferences/reference-intelligence'
import { sourceReferenceById } from '../data/sourceReferences/source-references'
import { isProductionEligibleSourceReference } from '../lib/referenceVerification/productApproval'
import type { ContentTypeId, CuratedCoreStatus, Reference, VisualReferenceQuality } from '../types/reference'

interface Props { references: Reference[] }

const contentTypes = Object.keys(labels.contentType) as ContentTypeId[]
const qualities: VisualReferenceQuality[] = ['premium', 'good', 'schematic', 'prototype', 'unknown']
const statuses: CuratedCoreStatus[] = ['eligible', 'review_only', 'excluded']

export function CuratedCoreReviewPage({ references }: Props) {
  const [contentType, setContentType] = useState('')
  const [quality, setQuality] = useState('')
  const [status, setStatus] = useState('')
  const filtered = useMemo(() => references.filter((reference) => (!contentType || reference.primaryContentTypeId === contentType) && (!quality || reference.visualReferenceQuality === quality) && (!status || reference.curatedCoreStatus === status)), [contentType, quality, status, references])
  const eligible = references.filter(({ curatedCoreStatus }) => curatedCoreStatus === 'eligible').length

  return <section className="mx-auto max-w-7xl" aria-labelledby="curated-review-title">
    <header className="surface p-5 sm:p-8"><p className="eyebrow">Internal · Test Mode</p><h1 id="curated-review-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Premium Curated Core Review</h1><p className="mt-3 max-w-4xl leading-7 text-muted">Явный продуктовый gate для production-выдачи. Из {references.length} физических референсов сейчас eligible: <strong className="text-navy">{eligible}</strong>.</p></header>
    <section className="surface mt-6 grid gap-4 p-5 sm:grid-cols-3 sm:p-6" aria-label="Фильтры Curated Core"><Filter label="Primary content type" value={contentType} onChange={setContentType} options={contentTypes} format={(value) => labels.contentType[value as ContentTypeId]} /><Filter label="Visual quality" value={quality} onChange={setQuality} options={qualities} /><Filter label="Curated status" value={status} onChange={setStatus} options={statuses} /><p className="text-sm text-muted sm:col-span-3">Показано: <strong className="text-navy">{filtered.length}</strong></p></section>
    <div className="mt-6 grid gap-5 lg:grid-cols-2">{filtered.map((reference) => <ReviewCard key={reference.id} reference={reference} />)}</div>
  </section>
}

function ReviewCard({ reference }: { reference: Reference }) {
  const sources = (referenceIntelligenceById.get(reference.id)?.sourceReferenceIds ?? []).flatMap((id) => sourceReferenceById.get(id) ?? [])
  const sourceVerified = sources.some(isProductionEligibleSourceReference)
  return <article className="surface overflow-hidden"><img src={`${import.meta.env.BASE_URL}${reference.previewPath}`} alt={`Preview ${reference.title}`} className="aspect-video w-full bg-slate-100 object-contain" /><div className="p-5 sm:p-6"><div className="flex flex-wrap gap-2"><Badge value={reference.id} /><Badge value={reference.curatedCoreStatus} /><Badge value={reference.visualReferenceQuality} /></div><h2 className="mt-4 text-xl font-bold text-navy">{reference.title}</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Meta label="Primary content" value={`${reference.primaryContentTypeId} · ${labels.contentType[reference.primaryContentTypeId]}`} /><Meta label="Family / direction" value={`${reference.compositionFamily} / ${reference.visualDirection}`} /><Meta label="Source / PIP original" value={reference.previewMode === 'original_pip_interpretation' ? 'PIP original interpretation' : reference.sourceLabel} /><Meta label="Production approved" value={reference.productionApproved ? 'yes' : 'no'} /><Meta label="Source verified" value={sourceVerified ? 'yes' : 'no'} /><Meta label="Screen suitable" value={reference.screenSuitable ? 'yes' : 'no'} /></dl></div></article>
}

function Filter({ label, value, onChange, options, format = (item) => item }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; format?: (value: string) => string }) { return <label className="text-sm font-semibold text-navy">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"><option value="">Все</option>{options.map((option) => <option key={option} value={option}>{format(option)}</option>)}</select></label> }
function Badge({ value }: { value: string }) { return <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue">{value}</span> }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-semibold text-navy">{value}</dd></div> }
