import { useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'

const referenceIssues = ['Не подходит дизайн', 'Не подходит структура', 'Не соответствует моей задаче', 'Слишком простой', 'Слишком сложный', 'Не нравится визуально', 'Другое']

export function ReferenceFeedbackForm({ referenceId }: { referenceId: string }) {
  const { activeSession, submitReferenceFeedback } = useFeedback()
  const existing = activeSession?.referenceFeedback.find((item) => item.referenceId === referenceId)
  const [useful, setUseful] = useState<boolean | null>(existing?.useful ?? null)
  const [issues, setIssues] = useState<string[]>(existing?.issues ?? [])
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [saved, setSaved] = useState(Boolean(existing))
  if (!activeSession?.query) return null
  const toggle = (issue: string) => setIssues((current) => current.includes(issue) ? current.filter((item) => item !== issue) : [...current, issue])

  return <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="reference-feedback-title">
    <h2 id="reference-feedback-title" className="text-xl font-semibold text-navy">Этот референс полезен?</h2>
    <div className="mt-4 flex gap-2"><button type="button" aria-pressed={useful === true} onClick={() => { setUseful(true); setIssues([]); setSaved(false) }} className={useful === true ? 'btn-primary' : 'btn-secondary'}>👍 Да</button><button type="button" aria-pressed={useful === false} onClick={() => { setUseful(false); setSaved(false) }} className={useful === false ? 'btn-primary' : 'btn-secondary'}>👎 Нет</button></div>
    {useful === false && <fieldset className="mt-5"><legend className="text-sm font-semibold text-navy">Почему?</legend><div className="mt-3 flex flex-wrap gap-2">{referenceIssues.map((issue) => <label key={issue} className={`cursor-pointer rounded-full border px-3 py-2 text-sm ${issues.includes(issue) ? 'border-blue bg-sky-50 text-navy' : 'border-line bg-white text-muted'}`}><input type="checkbox" checked={issues.includes(issue)} onChange={() => { toggle(issue); setSaved(false) }} className="sr-only" />{issue}</label>)}</div></fieldset>}
    {useful !== null && <><label className="mt-5 block text-sm font-semibold text-navy">Комментарий (необязательно)<textarea value={comment} onChange={(event) => { setComment(event.target.value); setSaved(false) }} rows={2} maxLength={1000} className="mt-2 w-full rounded-xl border border-line px-4 py-3 font-normal" /></label><p className="mt-2 text-xs text-muted">Не указывайте персональные данные.</p><div className="mt-4 flex items-center gap-4"><button type="button" className="btn-primary" onClick={() => { submitReferenceFeedback({ referenceId, useful, issues: useful ? [] : issues, comment: comment.trim() }); setSaved(true) }}>Сохранить</button>{saved && <span role="status" className="text-sm font-semibold text-success">Отзыв сохранён</span>}</div></>}
  </section>
}

