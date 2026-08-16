import { useState } from 'react'
import { coverRecoveryRound2Candidates, coverRound1Decisions, type CoverRecoveryCandidate } from '../data/coverRecoveryCandidates'
import { COVER_RECOVERY_COMMENT_MAX_LENGTH, createCoverRecoveryReviewExport, emptyCoverRecoveryReview, readCoverRecoveryReviews, writeCoverRecoveryReviews, type CoverRecoveryReview } from '../services/coverRecoveryReviewStorage'

export function CoverRecoveryReviewPage() {
  const [reviews, setReviews] = useState<Record<string, CoverRecoveryReview>>(() => readCoverRecoveryReviews())
  const [compareIds, setCompareIds] = useState<string[]>([])
  const update = (candidate: CoverRecoveryCandidate, change: Partial<CoverRecoveryReview>) => {
    const nextReview = { ...emptyCoverRecoveryReview(candidate.id), ...reviews[candidate.id], ...change, candidateId: candidate.id, reviewedAt: new Date().toISOString() }
    const next = { ...reviews, [candidate.id]: nextReview }
    setReviews(next)
    writeCoverRecoveryReviews(next)
  }
  const toggleCompare = (candidateId: string) => setCompareIds((current) => current.includes(candidateId) ? current.filter((id) => id !== candidateId) : current.length < 3 ? [...current, candidateId] : current)
  const compared = compareIds.flatMap((id) => coverRecoveryRound2Candidates.find((candidate) => candidate.id === id) ?? [])
  const exportReviews = () => {
    const json = `${JSON.stringify(createCoverRecoveryReviewExport(coverRecoveryRound2Candidates, reviews), null, 2)}\n`
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'cover-recovery-round2-po-review.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <section className="mx-auto max-w-7xl" aria-labelledby="cover-recovery-title">
    <header className="surface p-5 sm:p-8">
      <p className="eyebrow">Internal · Cover Recovery Round 2</p>
      <h1 id="cover-recovery-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Cover Recovery Round 2 Review</h1>
      <p className="mt-3 max-w-4xl leading-7 text-muted">В shortlist — {coverRecoveryRound2Candidates.length} вариантов из пяти visual families. Все решения локальны. Production exposure: <strong className="text-navy">0</strong>.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={exportReviews} className="btn-primary">Export Round 2 Review JSON</button><span className="text-sm font-semibold text-muted">Выбрано для сравнения: <strong className="text-navy">{compareIds.length} / 3</strong></span></div>
      {compareIds.length === 3 && <p role="status" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Можно сравнить максимум 3 варианта. Снимите один выбор, чтобы добавить другой.</p>}
    </header>

    {compared.length > 0 && <section className="surface mt-6 p-5 sm:p-6" aria-labelledby="cover-compare-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="cover-compare-title" className="text-2xl font-bold text-navy">Cover Compare Mode</h2><button type="button" onClick={() => setCompareIds([])} className="btn-ghost">Очистить</button></div>
      <div className={`mt-5 grid gap-4 ${compared.length > 1 ? 'md:grid-cols-2' : ''} ${compared.length > 2 ? 'xl:grid-cols-3' : ''}`}>{compared.map((candidate) => <article key={candidate.id} className="overflow-hidden rounded-2xl border border-line bg-white"><img src={`${import.meta.env.BASE_URL}${candidate.previewPath}`} alt={`Compare cover ${candidate.title}`} className="aspect-video w-full bg-slate-950 object-contain" /><div className="p-4"><p className="font-mono text-xs font-bold text-blue">{candidate.id}</p><h3 className="mt-2 font-bold text-navy">{candidate.title}</h3><p className="mt-2 text-sm text-muted">{candidate.visualFamily} · {candidate.origin}</p></div></article>)}</div>
    </section>}

    <div className="mt-6 grid gap-8">{coverRecoveryRound2Candidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} review={reviews[candidate.id] ?? emptyCoverRecoveryReview(candidate.id)} compared={compareIds.includes(candidate.id)} compareDisabled={!compareIds.includes(candidate.id) && compareIds.length >= 3} onCompare={() => toggleCompare(candidate.id)} onChange={(change) => update(candidate, change)} />)}</div>

    <details className="surface mt-8 p-5 sm:p-6"><summary className="cursor-pointer text-lg font-bold text-navy">Round 1 history and PO feedback</summary><div className="mt-5 grid gap-4 md:grid-cols-2">{coverRound1Decisions.map((decision) => <article key={decision.candidateId} className="rounded-2xl border border-line bg-slate-50 p-4"><div className="flex flex-wrap gap-2"><Badge>{decision.candidateId}</Badge><Badge>{decision.reviewStatus}</Badge></div><h2 className="mt-3 font-bold text-navy">{decision.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{decision.notes}</p></article>)}</div></details>
  </section>
}

function CandidateCard({ candidate, review, compared, compareDisabled, onCompare, onChange }: { candidate: CoverRecoveryCandidate; review: CoverRecoveryReview; compared: boolean; compareDisabled: boolean; onCompare: () => void; onChange: (change: Partial<CoverRecoveryReview>) => void }) {
  return <article className="surface overflow-hidden">
    <img src={`${import.meta.env.BASE_URL}${candidate.previewPath}`} alt={`Cover candidate ${candidate.title}`} className="aspect-video w-full bg-slate-950 object-contain" />
    <div className="p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2"><Badge>{candidate.id}</Badge><Badge>{candidate.visualFamily}</Badge><Badge>{candidate.origin}</Badge><Badge>{candidate.reviewStatus}</Badge><label className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-navy"><input type="checkbox" aria-label={`Сравнить ${candidate.id}`} checked={compared} disabled={compareDisabled} title={compareDisabled ? 'Можно сравнить максимум 3 варианта' : undefined} onChange={onCompare} />Compare</label></div>
      <h2 className="mt-4 text-2xl font-bold text-navy sm:text-3xl">{candidate.title}</h2>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"><Meta label="Visual family" value={candidate.visualFamily} /><Meta label="Origin" value={candidate.origin} /><Meta label="Parent candidate" value={candidate.parentCandidateId ?? '—'} /><Meta label="Production exposure" value="false" /><Meta label="Current → proposed type" value={`${candidate.currentContentType} → ${candidate.proposedContentType}`} /><Meta label="Composition family" value={candidate.compositionFamily} /><Meta label="Resolution" value={`${candidate.width}×${candidate.height}`} /><Meta label="Source" value={candidate.sourceOrigin === 'pip_original' ? 'PIP-original · no third-party assets' : 'Reclassified existing PIP reference'} /></dl>
      <div className="mt-5 grid gap-4 lg:grid-cols-2"><Info title="Почему это может быть сильным титульным слайдом" text={candidate.rationale} /><Info title="Применённый PO feedback" text={candidate.poFeedbackApplied} /></div>
      {candidate.revisionReason && <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-muted"><strong className="text-navy">Revision reason:</strong> {candidate.revisionReason}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><ReviewSelect label={`Visual quality ${candidate.id}`} value={review.visualQuality} options={[['strong', 'Strong'], ['medium', 'Medium'], ['weak', 'Weak']]} onChange={(visualQuality) => onChange({ visualQuality: visualQuality as CoverRecoveryReview['visualQuality'] })} /><ReviewSelect label={`Exact Cover ${candidate.id}`} value={review.exactCover} options={[['yes', 'Yes'], ['no', 'No']]} onChange={(exactCover) => onChange({ exactCover: exactCover as CoverRecoveryReview['exactCover'] })} /><ReviewSelect label={`Would use as inspiration ${candidate.id}`} value={review.wouldUseAsInspiration} options={[['yes', 'Yes'], ['no', 'No']]} onChange={(wouldUseAsInspiration) => onChange({ wouldUseAsInspiration: wouldUseAsInspiration as CoverRecoveryReview['wouldUseAsInspiration'] })} /><ReviewSelect label={`Decision ${candidate.id}`} value={review.decision} options={[['approve', 'APPROVE'], ['revise', 'REVISE'], ['reject', 'REJECT']]} onChange={(decision) => onChange({ decision: decision as CoverRecoveryReview['decision'] })} /></div>
      <label className="mt-4 block text-sm font-semibold text-navy">PO notes<textarea aria-label={`PO notes ${candidate.id}`} value={review.comment} maxLength={COVER_RECOVERY_COMMENT_MAX_LENGTH} onChange={(event) => onChange({ comment: event.target.value.slice(0, COVER_RECOVERY_COMMENT_MAX_LENGTH) })} className="mt-2 min-h-28 w-full rounded-xl border border-line p-3 font-normal" /></label>
    </div>
  </article>
}

function ReviewSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) { return <label className="text-sm font-semibold text-navy">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"><option value="">—</option>{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label> }
function Badge({ children }: { children: string }) { return <span className="break-all rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue">{children}</span> }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-semibold text-navy">{value}</dd></div> }
function Info({ title, text }: { title: string; text: string }) { return <section className="rounded-2xl border border-sky-100 bg-sky-50 p-4"><h3 className="font-bold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></section> }
