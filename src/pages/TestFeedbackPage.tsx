import { useFeedback } from '../hooks/useFeedback'
import { summarizeFeedback } from '../services/feedbackAnalytics'
import { exportFeedbackCsv, exportFeedbackJson } from '../services/feedbackStorage'
import { sourceReferences } from '../data/sourceReferences/source-references'
import { countBy, sourceReferenceSummary } from '../lib/referenceVerification/sourceReferenceCoverage'
import { isProductionEligibleSourceReference, productApprovalSummary } from '../lib/referenceVerification/productApproval'

function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function FrequencyList({ items, empty = 'Пока нет данных' }: { items: Array<[string, number]>; empty?: string }) {
  if (!items.length) return <p className="mt-3 text-sm text-muted">{empty}</p>
  return <ol className="mt-3 space-y-2">{items.slice(0, 6).map(([label, count]) => <li key={label} className="flex justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2 text-sm"><span className="text-navy">{label}</span><strong>{count}</strong></li>)}</ol>
}

export function TestFeedbackPage() {
  const { sessions, resetFeedback } = useFeedback()
  const summary = summarizeFeedback(sessions)
  const sourceSummary = sourceReferenceSummary(sourceReferences)
  const productSummary = productApprovalSummary(sourceReferences)
  const verifiedSources = sourceReferences.filter(({ sourceVerificationStatus }) => sourceVerificationStatus === 'source_verified')
  const approvedSources = sourceReferences.filter(isProductionEligibleSourceReference)
  const date = new Date().toISOString().slice(0, 10)
  const reset = () => {
    if (window.confirm('Удалить все локальные результаты тестирования?')) resetFeedback()
  }

  return <section className="mx-auto max-w-6xl" aria-labelledby="feedback-dashboard-title">
    <div className="surface p-5 sm:p-8">
      <p className="eyebrow">Служебный экран Product Owner</p>
      <h1 id="feedback-dashboard-title" className="mt-2 text-3xl font-bold text-navy sm:text-4xl">Экспорт данных тестирования</h1>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Локальные данные этого браузера.</strong> Результаты с других устройств не появляются здесь автоматически.</div>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" className="btn-primary" onClick={() => downloadText(`pip-feedback-${date}.json`, exportFeedbackJson(sessions), 'application/json;charset=utf-8')}>Скачать JSON</button><button type="button" className="btn-secondary" onClick={() => downloadText(`pip-feedback-${date}.csv`, exportFeedbackCsv(sessions), 'text/csv;charset=utf-8')}>Скачать CSV</button><button type="button" className="btn-ghost text-red-700" onClick={reset}>Удалить данные тестирования</button></div>
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {[['Total Sessions', summary.totalSessions], ['Completed Sessions', summary.completedSessions], ['Средняя оценка', summary.averageRating === null ? '—' : `${summary.averageRating.toFixed(1)} / 2`], ['Board additions', summary.boardAdditions.reduce((sum, [, count]) => sum + count, 0)], ['Нет подходящего', `${summary.noSuitableCount} · ${Math.round(summary.noSuitableShare * 100)}%`]].map(([label, value]) => <article key={label} className="surface p-5"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-navy">{value}</p></article>)}
    </div>

    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Метрики точности типа слайда">
      {[
        ['Среднее exact results', summary.averageExactResults === null ? '—' : summary.averageExactResults.toFixed(1)],
        ['Сессии exact ≥ 4', summary.exactAtLeastFourCount],
        ['Сессии с fallback', summary.fallbackSessionCount],
        ['Оценка при fallback', summary.fallbackAverageRating === null ? '—' : `${summary.fallbackAverageRating.toFixed(1)} / 2`],
        ['Нет подходящего при fallback', summary.fallbackNoSuitableCount],
      ].map(([label, value]) => <article key={label} className="surface p-5"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-2 text-3xl font-bold text-navy">{value}</p></article>)}
    </div>

    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Collection Ratings</h2><FrequencyList items={[["Полезная", summary.ratings.useful], ["Частично полезная", summary.ratings.partially_useful], ["Не подходит", summary.ratings.not_useful]]} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Usable Reference Found</h2><FrequencyList items={[["Да", summary.usableReferences.yes], ["Скорее да", summary.usableReferences.probably_yes], ["Скорее нет", summary.usableReferences.probably_no], ["Нет", summary.usableReferences.no]]} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Best Reference selections</h2><FrequencyList items={summary.bestReferences} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Чаще добавляли на доску</h2><FrequencyList items={summary.boardAdditions} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Самые частые проблемы</h2><FrequencyList items={summary.issues} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Чаще открывали</h2><FrequencyList items={summary.openedReferences} /></section>
    </div>

    <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="verified-metrics-title">
      <p className="eyebrow">Verified Source Metrics</p><h2 id="verified-metrics-title" className="mt-2 text-2xl font-semibold text-navy">Состояние source layer</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Source verified', sourceSummary.verified], ['PIP approved', productSummary.pipApproved], ['PIP rejected', productSummary.pipRejected], ['Awaiting PO review', productSummary.awaitingPoReview]].map(([label, value]) => <article key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-1 text-3xl font-bold text-navy">{value}</p></article>)}</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div><h3 className="font-semibold text-navy">По типу слайда</h3><FrequencyList items={countBy(verifiedSources.map(({ primaryContentTypeId }) => primaryContentTypeId))} /></div>
        <div><h3 className="font-semibold text-navy">По организациям</h3><FrequencyList items={countBy(verifiedSources.map(({ organization }) => organization))} /></div>
        <div><h3 className="font-semibold text-navy">По правам</h3><FrequencyList items={countBy(verifiedSources.map(({ rightsStatus }) => rightsStatus))} /></div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="font-semibold text-navy">PIP approved по типу слайда</h3><FrequencyList items={countBy(approvedSources.map(({ primaryContentTypeId }) => primaryContentTypeId))} /></div><div><h3 className="font-semibold text-navy">PIP approved организации</h3><FrequencyList items={countBy(approvedSources.map(({ organization }) => organization))} /></div></div>
    </section>

    <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="fresh-discovery-metrics-title">
      <p className="eyebrow">Fresh Discovery Metrics</p><h2 id="fresh-discovery-metrics-title" className="mt-2 text-2xl font-semibold text-navy">Fresh Discovery 2.5</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Prompt shown', summary.freshDiscovery.shown], ['Prompt copied', summary.freshDiscovery.copied], ['Provider selector opened', summary.freshDiscovery.selectorOpened], ['Provider open success rate', `${Math.round(summary.freshDiscovery.providerOpenSuccessRate * 100)}%`]].map(([label, value]) => <article key={label} className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-1 text-3xl font-bold text-navy">{value}</p></article>)}</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3"><article className="rounded-xl border border-sky-100 bg-sky-50 p-4"><p className="text-sm font-semibold text-muted">Self-reported successful search rate</p><p className="mt-1 text-3xl font-bold text-navy">{Math.round(summary.freshDiscovery.successfulSearchRate * 100)}%</p></article><article className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-muted">Provider open failures</p><p className="mt-1 text-3xl font-bold text-navy">{summary.freshDiscovery.providerOpenFailed}</p></article><article className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold text-muted">Post-search feedback</p><p className="mt-1 text-3xl font-bold text-navy">{summary.freshDiscovery.postSearchFeedbackSubmitted}</p></article></div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><div><h3 className="font-semibold text-navy">Provider selected</h3><FrequencyList items={summary.freshDiscovery.providerShare} /></div><div><h3 className="font-semibold text-navy">Useful refs</h3><FrequencyList items={[["0", summary.freshDiscovery.usefulReferences['0']], ["1–2", summary.freshDiscovery.usefulReferences['1_2']], ["3–4", summary.freshDiscovery.usefulReferences['3_4']], ["5+", summary.freshDiscovery.usefulReferences['5_plus']]]} /></div><div><h3 className="font-semibold text-navy">Would use again</h3><FrequencyList items={[["yes", summary.freshDiscovery.wouldUseAgain.yes], ["maybe", summary.freshDiscovery.wouldUseAgain.maybe], ["no", summary.freshDiscovery.wouldUseAgain.no]]} /></div><div><h3 className="font-semibold text-navy">Visual quality</h3><FrequencyList items={[["strong", summary.freshDiscovery.visualQuality.strong], ["good", summary.freshDiscovery.visualQuality.good], ["average", summary.freshDiscovery.visualQuality.average], ["weak", summary.freshDiscovery.visualQuality.weak]]} /></div></div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3"><div><h3 className="font-semibold text-navy">Prompt version</h3><FrequencyList items={summary.freshDiscovery.byVersion} /></div><div><h3 className="font-semibold text-navy">Copied by content type</h3><FrequencyList items={summary.freshDiscovery.byContentType} /></div><div><h3 className="font-semibold text-navy">Copied by scenario</h3><FrequencyList items={summary.freshDiscovery.byScenario} /></div></div>
    </section>

    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="surface p-5 sm:p-7" aria-labelledby="intelligence-metrics-title">
        <p className="eyebrow">Intelligence Metrics</p><h2 id="intelligence-metrics-title" className="mt-2 text-2xl font-semibold text-navy">Понимание композиции</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{[
          ['Opened sessions', summary.intelligence.openedSessions], ['Data Mapping views', summary.intelligence.dataMappingViews], ['Source clicks', summary.intelligence.sourceClicks], ['Helpful', summary.intelligence.helpful], ['Partial', summary.intelligence.partiallyHelpful], ['Not helpful', summary.intelligence.notHelpful],
        ].map(([label, value]) => <article key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-1 text-2xl font-bold text-navy">{value}</p></article>)}</div>
        <h3 className="mt-5 font-semibold text-navy">Комментарии</h3><TextList items={summary.intelligence.comments} />
      </section>
      <section className="surface p-5 sm:p-7" aria-labelledby="missing-metrics-title">
        <p className="eyebrow">Missing Reference Metrics</p><h2 id="missing-metrics-title" className="mt-2 text-2xl font-semibold text-navy">Чего не хватило</h2>
        <p className="mt-4 text-4xl font-bold text-navy">{summary.missingReferences.submissions}</p><p className="text-sm text-muted">текстовых ответов</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3"><div><h3 className="text-sm font-semibold text-navy">Content type</h3><FrequencyList items={summary.missingReferences.byContentType} /></div><div><h3 className="text-sm font-semibold text-navy">Scenario</h3><FrequencyList items={summary.missingReferences.byScenario} /></div><div><h3 className="text-sm font-semibold text-navy">Style</h3><FrequencyList items={summary.missingReferences.byStyle} /></div></div>
        <h3 className="mt-5 font-semibold text-navy">Raw text export preview</h3><TextList items={summary.missingReferences.raw} />
      </section>
    </div>
  </section>
}

function TextList({ items }: { items: Array<[string, string]> }) {
  if (!items.length) return <p className="mt-3 text-sm text-muted">Пока нет данных</p>
  return <ul className="mt-3 space-y-2">{items.slice(0, 8).map(([id, text]) => <li key={`${id}-${text}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6"><strong className="break-all text-navy">{id}</strong><p className="mt-1 break-words text-muted">{text}</p></li>)}</ul>
}
