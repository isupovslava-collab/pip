import { useFeedback } from '../hooks/useFeedback'
import { summarizeFeedback } from '../services/feedbackAnalytics'
import { exportFeedbackCsv, exportFeedbackJson } from '../services/feedbackStorage'

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

    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Collection Ratings</h2><FrequencyList items={[["Полезная", summary.ratings.useful], ["Частично полезная", summary.ratings.partially_useful], ["Не подходит", summary.ratings.not_useful]]} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Usable Reference Found</h2><FrequencyList items={[["Да", summary.usableReferences.yes], ["Скорее да", summary.usableReferences.probably_yes], ["Скорее нет", summary.usableReferences.probably_no], ["Нет", summary.usableReferences.no]]} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Best Reference selections</h2><FrequencyList items={summary.bestReferences} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Чаще добавляли на доску</h2><FrequencyList items={summary.boardAdditions} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Самые частые проблемы</h2><FrequencyList items={summary.issues} /></section>
      <section className="surface p-5 sm:p-6"><h2 className="text-xl font-semibold text-navy">Чаще открывали</h2><FrequencyList items={summary.openedReferences} /></section>
    </div>
  </section>
}
