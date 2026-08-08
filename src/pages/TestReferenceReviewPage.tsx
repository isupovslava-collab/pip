import { useMemo, useState } from 'react'
import { labels } from '../data/dictionaries'
import { sourceReferences, sourceVerificationReviewById } from '../data/sourceReferences/source-references'
import { sourceReferenceCoverage, sourceReferenceSummary } from '../lib/referenceVerification/sourceReferenceCoverage'
import type { ResearchOrigin, SourceRightsStatus, VerificationStatus } from '../types/sourceReference'
import { Icon } from '../components/Icon'

type FilterKey = 'status' | 'contentType' | 'scenario' | 'organization' | 'rights' | 'origin' | 'duplicate'
type Filters = Record<FilterKey, string>
const initialFilters: Filters = { status: '', contentType: '', scenario: '', organization: '', rights: '', origin: '', duplicate: '' }
const gateLabels = { sourceGate: 'Source', documentGate: 'Document', pageGate: 'Page', visualGate: 'Visual', contentTypeGate: 'Content Type', scenarioGate: 'Scenario', rightsGate: 'Rights' }

function unique(values: string[]) { return [...new Set(values)].sort((a, b) => a.localeCompare(b)) }

export function TestReferenceReviewPage() {
  const [filters, setFilters] = useState(initialFilters)
  const summary = sourceReferenceSummary(sourceReferences)
  const coverage = sourceReferenceCoverage(sourceReferences)
  const options = {
    organization: unique(sourceReferences.map(({ organization }) => organization)),
    rights: unique(sourceReferences.map(({ rightsStatus }) => rightsStatus)),
    origin: unique(sourceReferences.flatMap(({ researchOrigins }) => researchOrigins)),
    duplicate: unique(sourceReferences.flatMap(({ duplicateGroupId }) => duplicateGroupId ? [duplicateGroupId] : [])),
  }
  const filtered = useMemo(() => sourceReferences.filter((source) => (
    (!filters.status || source.verificationStatus === filters.status)
    && (!filters.contentType || source.primaryContentTypeId === filters.contentType)
    && (!filters.scenario || source.primaryScenarioId === filters.scenario)
    && (!filters.organization || source.organization === filters.organization)
    && (!filters.rights || source.rightsStatus === filters.rights)
    && (!filters.origin || source.researchOrigins.includes(filters.origin as ResearchOrigin))
    && (!filters.duplicate || source.duplicateGroupId === filters.duplicate)
  )), [filters])
  const setFilter = (key: FilterKey, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  return <section className="mx-auto max-w-7xl" aria-labelledby="source-review-title">
    <div className="surface p-5 sm:p-8">
      <p className="eyebrow">Internal · Test Mode</p>
      <h1 id="source-review-title" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Verified Reference Review</h1>
      <p className="mt-3 max-w-4xl leading-7 text-muted">SourceReference отделён от production-библиотеки PIP. Этот экран показывает факты, семь gate-проверок и честные пробелы покрытия; он не является CMS.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        ['Нормализовано', summary.total], ['Verified', summary.verified], ['Source found', summary.sourceFound], ['Rejected', summary.rejected],
      ].map(([label, value]) => <article key={label} className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-1 text-3xl font-bold text-navy">{value}</p></article>)}</div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">{coverage.map((row) => <article key={row.contentTypeId} className="rounded-xl border border-sky-100 bg-sky-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-blue">{row.contentTypeId}</p><p className="mt-1 font-semibold text-navy">{row.verifiedCount} / 3</p></article>)}</div>
    </div>

    <section className="surface mt-6 p-5 sm:p-6" aria-label="Фильтры первоисточников">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Filter label="Status" value={filters.status} onChange={(value) => setFilter('status', value)} options={['candidate', 'source_found', 'verified', 'rejected']} />
        <Filter label="Content type" value={filters.contentType} onChange={(value) => setFilter('contentType', value)} options={Object.keys(labels.contentType)} format={(value) => labels.contentType[value as keyof typeof labels.contentType]} />
        <Filter label="Scenario" value={filters.scenario} onChange={(value) => setFilter('scenario', value)} options={Object.keys(labels.scenario)} format={(value) => labels.scenario[value as keyof typeof labels.scenario]} />
        <Filter label="Organization" value={filters.organization} onChange={(value) => setFilter('organization', value)} options={options.organization} />
        <Filter label="Rights" value={filters.rights} onChange={(value) => setFilter('rights', value)} options={options.rights as SourceRightsStatus[]} />
        <Filter label="Research origin" value={filters.origin} onChange={(value) => setFilter('origin', value)} options={options.origin} />
        <Filter label="Duplicate group" value={filters.duplicate} onChange={(value) => setFilter('duplicate', value)} options={options.duplicate} />
        <div className="flex items-end"><button type="button" className="btn-secondary w-full" onClick={() => setFilters(initialFilters)}>Сбросить фильтры</button></div>
      </div>
      <p className="mt-4 text-sm text-muted">Показано: <strong className="text-navy">{filtered.length}</strong> из {sourceReferences.length}</p>
    </section>

    <div className="mt-6 grid gap-5 xl:grid-cols-2">{filtered.map((source) => {
      const review = sourceVerificationReviewById.get(source.id)
      return <article key={source.id} className="surface min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-sm font-bold text-blue">{source.id}</span><StatusBadge status={source.verificationStatus} /></div>
        <h2 className="mt-4 break-words text-xl font-semibold text-navy">{source.originalSlideTitle ?? source.curatorLabel}</h2>
        <p className="mt-2 break-words font-semibold text-muted">{source.presentationTitle}</p>
        <p className="mt-1 break-words text-sm text-muted">{source.organization}{source.pageNumber ? ` · page ${source.pageNumber}` : ' · page not verified'}</p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Meta label="Primary type" value={`${source.primaryContentTypeId} · ${labels.contentType[source.primaryContentTypeId]}`} />
          <Meta label="Scenario" value={`${source.primaryScenarioId} · ${labels.scenario[source.primaryScenarioId]}`} />
          <Meta label="Research origins" value={source.researchOrigins.join(', ')} />
          <Meta label="Rights" value={source.rightsStatus} />
          <Meta label="Display mode" value={source.displayMode} />
          <Meta label="Duplicate group" value={source.duplicateGroupId ?? '—'} />
        </dl>
        <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue">Composition principle</p><p className="mt-2 text-sm leading-6 text-muted">{source.compositionPrinciple}</p></div>
        {source.rejectionReason && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"><strong>Rejection:</strong> {source.rejectionReason}</div>}
        <div className="mt-5"><p className="text-sm font-semibold text-navy">Verification checklist</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(gateLabels).map(([key, label]) => {
          const pass = review?.[key as keyof typeof gateLabels] === 'pass'
          return <span key={key} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${pass ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}><Icon name={pass ? 'check' : 'warning'} className="h-4 w-4" />{label}</span>
        })}</div></div>
        <div className="mt-5 flex flex-col justify-between gap-4 border-t border-line pt-5 sm:flex-row sm:items-center"><p className="text-xs leading-5 text-muted">Visual review: <strong>{review?.visualReview}</strong><br />PIP relevance: <strong>{review?.pipRelevance}</strong></p><a href={source.directDocumentUrl ?? source.primaryUrl} target="_blank" rel="noreferrer" className="btn-primary shrink-0">Open Source<Icon name="arrow-right" className="h-4 w-4" /></a></div>
      </article>
    })}</div>
  </section>
}

function Filter({ label, value, onChange, options, format = (item) => item }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; format?: (value: string) => string }) {
  return <label className="text-sm font-semibold text-navy">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal text-navy"><option value="">Все</option>{options.map((option) => <option key={option} value={option}>{format(option)}</option>)}</select></label>
}
function Meta({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-medium text-navy">{value}</dd></div> }
function StatusBadge({ status }: { status: VerificationStatus }) { const styles = { verified: 'bg-emerald-100 text-emerald-800', source_found: 'bg-sky-100 text-sky-800', candidate: 'bg-amber-100 text-amber-900', rejected: 'bg-red-100 text-red-800' }; return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status]}`}>{status}</span> }
