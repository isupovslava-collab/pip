import { useState } from 'react'
import { coverRecoveryCandidates, type CoverRecoveryCandidate } from '../data/coverRecoveryCandidates'
import { COVER_RECOVERY_COMMENT_MAX_LENGTH, createCoverRecoveryReviewExport, emptyCoverRecoveryReview, readCoverRecoveryReviews, writeCoverRecoveryReviews, type CoverRecoveryReview } from '../services/coverRecoveryReviewStorage'

export function CoverRecoveryReviewPage() {
  const [reviews, setReviews] = useState<Record<string, CoverRecoveryReview>>(() => readCoverRecoveryReviews())
  const update = (candidate: CoverRecoveryCandidate, change: Partial<CoverRecoveryReview>) => {
    const nextReview = { ...emptyCoverRecoveryReview(candidate.id), ...reviews[candidate.id], ...change, candidateId: candidate.id, reviewedAt: new Date().toISOString() }
    const next = { ...reviews, [candidate.id]: nextReview }
    setReviews(next)
    writeCoverRecoveryReviews(next)
  }
  const exportReviews = () => {
    const json = `${JSON.stringify(createCoverRecoveryReviewExport(coverRecoveryCandidates, reviews), null, 2)}\n`
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'cover-recovery-po-review.json'
    link.click()
    URL.revokeObjectURL(url)
  }
  return <section className="mx-auto max-w-7xl" aria-labelledby="cover-recovery-title">
    <header className="surface p-5 sm:p-8"><p className="eyebrow">Internal · Cover Recovery Pack</p><h1 id="cover-recovery-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Cover Recovery Review</h1><p className="mt-3 max-w-4xl leading-7 text-muted">Четыре оригинальных PIP-candidates подготовлены только для визуального review. Production exposure: <strong className="text-navy">0</strong>. Решения сохраняются локально и не применяются автоматически.</p><button type="button" onClick={exportReviews} className="btn-primary mt-5">Export Cover Review JSON</button></header>
    <div className="mt-6 grid gap-7 xl:grid-cols-2">{coverRecoveryCandidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} review={reviews[candidate.id] ?? emptyCoverRecoveryReview(candidate.id)} onChange={(change) => update(candidate, change)} />)}</div>
  </section>
}

function CandidateCard({ candidate, review, onChange }: { candidate: CoverRecoveryCandidate; review: CoverRecoveryReview; onChange: (change: Partial<CoverRecoveryReview>) => void }) {
  return <article className="surface overflow-hidden"><img src={`${import.meta.env.BASE_URL}${candidate.previewPath}`} alt={`Cover candidate ${candidate.title}`} className="aspect-video w-full bg-slate-950 object-contain" /><div className="p-5 sm:p-6"><div className="flex flex-wrap gap-2"><Badge>{candidate.id}</Badge><Badge>{candidate.curatedCoreStatus}</Badge><Badge>{candidate.poReviewDisposition}</Badge></div><h2 className="mt-4 text-2xl font-bold text-navy">{candidate.title}</h2><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><Meta label="Visual direction" value={candidate.visualDirection} /><Meta label="Composition family" value={candidate.compositionFamily} /><Meta label="Resolution" value={`${candidate.width}×${candidate.height}`} /><Meta label="Source" value="PIP-original · no third-party assets" /></dl><div className="mt-5 grid gap-4 sm:grid-cols-2"><ReviewSelect label="1. Visual quality" value={review.visualQuality} options={[['strong', 'Strong'], ['medium', 'Medium'], ['weak', 'Weak']]} onChange={(visualQuality) => onChange({ visualQuality: visualQuality as CoverRecoveryReview['visualQuality'] })} /><ReviewSelect label="2. Exact Cover" value={review.exactCover} options={[['yes', 'Yes'], ['no', 'No']]} onChange={(exactCover) => onChange({ exactCover: exactCover as CoverRecoveryReview['exactCover'] })} /><ReviewSelect label="3. Would use as inspiration" value={review.wouldUseAsInspiration} options={[['yes', 'Yes'], ['no', 'No']]} onChange={(wouldUseAsInspiration) => onChange({ wouldUseAsInspiration: wouldUseAsInspiration as CoverRecoveryReview['wouldUseAsInspiration'] })} /><ReviewSelect label="4. Decision" value={review.decision} options={[['approve', 'APPROVE'], ['revise', 'REVISE'], ['reject', 'REJECT']]} onChange={(decision) => onChange({ decision: decision as CoverRecoveryReview['decision'] })} /></div><label className="mt-4 block text-sm font-semibold text-navy">5. Comment<textarea aria-label={`Comment ${candidate.id}`} value={review.comment} maxLength={COVER_RECOVERY_COMMENT_MAX_LENGTH} onChange={(event) => onChange({ comment: event.target.value.slice(0, COVER_RECOVERY_COMMENT_MAX_LENGTH) })} className="mt-2 min-h-28 w-full rounded-xl border border-line p-3 font-normal" /></label></div></article>
}

function ReviewSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) { return <label className="text-sm font-semibold text-navy">{label}<select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 font-normal"><option value="">—</option>{options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}</select></label> }
function Badge({ children }: { children: string }) { return <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-blue">{children}</span> }
function Meta({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words font-semibold text-navy">{value}</dd></div> }
