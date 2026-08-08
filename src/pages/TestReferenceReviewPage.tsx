import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { labels } from '../data/dictionaries'
import { pipProductReviewById, sourceReferences, sourceVerificationReviewById } from '../data/sourceReferences/source-references'
import { approvedReferenceCoverage, productApprovalSummary } from '../lib/referenceVerification/productApproval'
import { sourceReferenceCoverage, sourceReferenceSummary } from '../lib/referenceVerification/sourceReferenceCoverage'
import type { PipProductReviewStatus, ResearchOrigin, SourceVerificationStatus } from '../types/sourceReference'

type FilterKey = 'sourceStatus' | 'productStatus' | 'semantic' | 'visual' | 'screen' | 'freshness' | 'contentType' | 'scenario' | 'organization' | 'rights' | 'origin'
type Filters = Record<FilterKey, string>
const initialFilters: Filters = { sourceStatus: '', productStatus: '', semantic: '', visual: '', screen: '', freshness: '', contentType: '', scenario: '', organization: '', rights: '', origin: '' }
const gateLabels = { sourceGate: 'Source', documentGate: 'Document', pageGate: 'Page', visualGate: 'Visual', contentTypeGate: 'Content Type', scenarioGate: 'Scenario', rightsGate: 'Rights' }
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))

export function TestReferenceReviewPage() {
  const [filters, setFilters] = useState(initialFilters)
  const sourceSummary = sourceReferenceSummary(sourceReferences)
  const productSummary = productApprovalSummary(sourceReferences)
  const sourceCoverage = sourceReferenceCoverage(sourceReferences)
  const approvedCoverage = approvedReferenceCoverage(sourceReferences)
  const options = {
    organization: unique(sourceReferences.map(({ organization }) => organization)),
    rights: unique(sourceReferences.map(({ rightsStatus }) => rightsStatus)),
    origin: unique(sourceReferences.flatMap(({ researchOrigins }) => researchOrigins)),
  }
  const filtered = useMemo(() => sourceReferences.filter((source) => {
    const product = pipProductReviewById.get(source.id)
    return (!filters.sourceStatus || source.sourceVerificationStatus === filters.sourceStatus)
      && (!filters.productStatus || source.pipProductReviewStatus === filters.productStatus)
      && (!filters.semantic || product?.semanticFit === filters.semantic)
      && (!filters.visual || product?.visualInspiration === filters.visual)
      && (!filters.screen || product?.screenSuitability === filters.screen)
      && (!filters.freshness || product?.designFreshness === filters.freshness)
      && (!filters.contentType || source.primaryContentTypeId === filters.contentType)
      && (!filters.scenario || source.primaryScenarioId === filters.scenario)
      && (!filters.organization || source.organization === filters.organization)
      && (!filters.rights || source.rightsStatus === filters.rights)
      && (!filters.origin || source.researchOrigins.includes(filters.origin as ResearchOrigin))
  }), [filters])
  const setFilter = (key: FilterKey, value: string) => setFilters((current) => ({ ...current, [key]: value }))

  return <section className="mx-auto max-w-7xl" aria-labelledby="source-review-title">
    <div className="surface p-5 sm:p-8">
      <p className="eyebrow">Internal · Test Mode</p>
      <h1 id="source-review-title" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Source &amp; Product Reference Review</h1>
      <p className="mt-3 max-w-4xl leading-7 text-muted">Source Verification подтверждает происхождение и права. PIP Product Review отдельно решает, достоин ли материал production-badge и показа как источник профессионального вдохновения.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        ['Source verified', productSummary.sourceVerified], ['PIP approved', productSummary.pipApproved], ['PIP rejected', productSummary.pipRejected], ['Awaiting PO review', productSummary.awaitingPoReview],
      ].map(([label, value]) => <Metric key={label} label={String(label)} value={value} />)}</div>
      <p className="mt-4 text-sm text-muted">Всего нормализовано: <strong className="text-navy">{sourceSummary.total}</strong> · source found: {sourceSummary.sourceFound} · source rejected: {sourceSummary.rejected}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">{sourceCoverage.map((row) => {
        const approved = approvedCoverage.find(({ contentTypeId }) => contentTypeId === row.contentTypeId)!
        return <article key={row.contentTypeId} className="rounded-xl border border-sky-100 bg-sky-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-blue">{row.contentTypeId}</p><p className="mt-1 font-semibold text-navy">Source {row.verifiedCount} · PIP {approved.pipApprovedCount}</p></article>
      })}</div>
    </div>

    <section className="surface mt-6 p-5 sm:p-6" aria-label="Фильтры первоисточников">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Filter label="Source Status" value={filters.sourceStatus} onChange={(value) => setFilter('sourceStatus', value)} options={['candidate', 'source_found', 'source_verified', 'source_rejected']} />
        <Filter label="Product Status" value={filters.productStatus} onChange={(value) => setFilter('productStatus', value)} options={['awaiting_po_review', 'pip_approved', 'pip_rejected']} />
        <Filter label="Semantic Fit" value={filters.semantic} onChange={(value) => setFilter('semantic', value)} options={['pass', 'warning', 'fail']} />
        <Filter label="Visual Inspiration" value={filters.visual} onChange={(value) => setFilter('visual', value)} options={['pass', 'warning', 'fail']} />
        <Filter label="Screen Suitability" value={filters.screen} onChange={(value) => setFilter('screen', value)} options={['pass', 'warning', 'fail']} />
        <Filter label="Design Freshness" value={filters.freshness} onChange={(value) => setFilter('freshness', value)} options={['current', 'still_relevant', 'dated', 'not_assessed']} />
        <Filter label="Content type" value={filters.contentType} onChange={(value) => setFilter('contentType', value)} options={Object.keys(labels.contentType)} format={(value) => labels.contentType[value as keyof typeof labels.contentType]} />
        <Filter label="Scenario" value={filters.scenario} onChange={(value) => setFilter('scenario', value)} options={Object.keys(labels.scenario)} format={(value) => labels.scenario[value as keyof typeof labels.scenario]} />
        <Filter label="Organization" value={filters.organization} onChange={(value) => setFilter('organization', value)} options={options.organization} />
        <Filter label="Rights" value={filters.rights} onChange={(value) => setFilter('rights', value)} options={options.rights} />
        <Filter label="Research origin" value={filters.origin} onChange={(value) => setFilter('origin', value)} options={options.origin} />
        <div className="flex items-end"><button type="button" className="btn-secondary w-full" onClick={() => setFilters(initialFilters)}>Сбросить фильтры</button></div>
      </div>
      <p className="mt-4 text-sm text-muted">Показано: <strong className="text-navy">{filtered.length}</strong> из {sourceReferences.length}</p>
    </section>

    <div className="mt-6 grid gap-5 xl:grid-cols-2">{filtered.map((source) => {
      const verification = sourceVerificationReviewById.get(source.id)
      const product = pipProductReviewById.get(source.id)
      return <article key={source.id} className="surface min-w-0 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-sm font-bold text-blue">{source.id}</span><div className="flex flex-wrap gap-2"><SourceStatusBadge status={source.sourceVerificationStatus} /><ProductStatusBadge status={source.pipProductReviewStatus} /></div></div>
        <h2 className="mt-4 break-words text-xl font-semibold text-navy">{source.originalSlideTitle ?? source.curatorLabel}</h2>
        <p className="mt-2 break-words font-semibold text-muted">{source.presentationTitle}</p>
        <p className="mt-1 break-words text-sm text-muted">{source.organization}{source.pageNumber ? ` · page ${source.pageNumber}` : ' · page not verified'}</p>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Meta label="Primary type" value={`${source.primaryContentTypeId} · ${labels.contentType[source.primaryContentTypeId]}`} />
          <Meta label="Scenario" value={`${source.primaryScenarioId} · ${labels.scenario[source.primaryScenarioId]}`} />
          <Meta label="Research origins" value={source.researchOrigins.join(', ')} />
          <Meta label="Rights" value={`${source.rightsStatus}${source.licenseName ? ` · ${source.licenseName}` : ''}`} />
          <Meta label="Display mode" value={source.displayMode} />
          <Meta label="Source stability" value={source.sourceStability} />
        </dl>
        <div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-blue">Composition principle</p><p className="mt-2 text-sm leading-6 text-muted">{source.compositionPrinciple}</p></div>
        {source.rejectionReason && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"><strong>Source rejection:</strong> {source.rejectionReason}</div>}
        <div className="mt-5"><p className="text-sm font-semibold text-navy">Source Verification</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(gateLabels).map(([key, label]) => {
          const pass = verification?.[key as keyof typeof gateLabels] === 'pass'
          return <span key={key} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${pass ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}><Icon name={pass ? 'check' : 'warning'} className="h-4 w-4" />{label}</span>
        })}</div></div>
        <div className="mt-5 rounded-xl border border-line p-4"><p className="text-sm font-semibold text-navy">PIP Product Review</p><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><Meta label="Semantic Fit" value={product?.semanticFit ?? 'not_assessed'} /><Meta label="Visual Inspiration" value={product?.visualInspiration ?? 'not_assessed'} /><Meta label="Screen Suitability" value={product?.screenSuitability ?? 'not_assessed'} /><Meta label="Design Freshness" value={product?.designFreshness ?? 'not_assessed'} /></dl><p className="mt-3 text-xs leading-5 text-muted">PO decision: <strong>{source.pipProductReviewStatus}</strong>{product?.poReviewedAt ? ` · ${product.poReviewedAt}` : ''}<br />{product?.poNotes.join(' ') || 'Решение Product Owner ещё не зафиксировано.'}{product?.rejectionReasons.length ? ` Reasons: ${product.rejectionReasons.join(', ')}.` : ''}</p></div>
        <div className="mt-5 flex justify-end border-t border-line pt-5"><a href={source.directDocumentUrl ?? source.primaryUrl} target="_blank" rel="noreferrer" className="btn-primary shrink-0">Open Source<Icon name="arrow-right" className="h-4 w-4" /></a></div>
      </article>
    })}</div>
  </section>
}

function Metric({ label, value }: { label: string; value: string | number }) { return <article className="rounded-2xl border border-line bg-slate-50 p-4"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-1 text-3xl font-bold text-navy">{value}</p></article> }
function Filter({ label, value, onChange, options, format = (item) => item }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[]; format?: (value: string) => string }) { return <label className="text-sm font-semibold text-navy">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal text-navy"><option value="">Все</option>{options.map((option) => <option key={option} value={option}>{format(option)}</option>)}</select></label> }
function Meta({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-medium text-navy">{value}</dd></div> }
function SourceStatusBadge({ status }: { status: SourceVerificationStatus }) { const styles: Record<SourceVerificationStatus, string> = { source_verified: 'bg-emerald-100 text-emerald-800', source_found: 'bg-sky-100 text-sky-800', candidate: 'bg-amber-100 text-amber-900', source_rejected: 'bg-red-100 text-red-800' }; return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status]}`}>Source: {status}</span> }
function ProductStatusBadge({ status }: { status: PipProductReviewStatus }) { const styles: Record<PipProductReviewStatus, string> = { pip_approved: 'bg-blue-100 text-blue-900', awaiting_po_review: 'bg-amber-100 text-amber-900', pip_rejected: 'bg-red-100 text-red-800' }; return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${styles[status]}`}>Product: {status}</span> }
