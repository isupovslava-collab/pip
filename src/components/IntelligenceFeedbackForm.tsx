import { useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import { FEEDBACK_COMMENT_MAX_LENGTH, type IntelligenceHelpful } from '../types/feedback'

const answers: Array<{ value: IntelligenceHelpful; label: string }> = [
  { value: 'helpful', label: 'Да' }, { value: 'partially_helpful', label: 'Частично' }, { value: 'not_helpful', label: 'Нет' },
]

export function IntelligenceFeedbackForm({ referenceId }: { referenceId: string }) {
  const { activeSession, submitIntelligenceFeedback } = useFeedback()
  const [answer, setAnswer] = useState<IntelligenceHelpful | null>(activeSession?.intelligenceHelpful ?? null)
  const [comment, setComment] = useState(activeSession?.intelligenceComment ?? '')
  const [saved, setSaved] = useState(Boolean(activeSession?.intelligenceHelpful))
  if (!activeSession?.query) return null

  return <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="intelligence-feedback-title">
    <p className="eyebrow">Test Mode</p><h2 id="intelligence-feedback-title" className="mt-2 text-xl font-semibold text-navy">Помог ли разбор понять, как использовать этот дизайн?</h2>
    <div className="mt-4 flex flex-wrap gap-2">{answers.map((item) => <button key={item.value} type="button" aria-pressed={answer === item.value} className={answer === item.value ? 'btn-primary' : 'btn-secondary'} onClick={() => { setAnswer(item.value); setSaved(false) }}>{item.label}</button>)}</div>
    {answer && <><label className="mt-5 block text-sm font-semibold text-navy">Комментарий (необязательно)<textarea value={comment} onChange={(event) => { setComment(event.target.value.slice(0, FEEDBACK_COMMENT_MAX_LENGTH)); setSaved(false) }} rows={3} maxLength={FEEDBACK_COMMENT_MAX_LENGTH} className="mt-2 w-full resize-y rounded-xl border border-line px-4 py-3 font-normal" /></label><div className="mt-4 flex flex-wrap items-center gap-4"><button type="button" className="btn-primary" onClick={() => { submitIntelligenceFeedback(referenceId, answer, comment); setSaved(true) }}>Сохранить</button>{saved && <span role="status" className="text-sm font-semibold text-success">Ответ сохранён</span>}</div></>}
  </section>
}
