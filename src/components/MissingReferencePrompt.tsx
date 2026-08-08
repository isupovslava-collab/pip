import { useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import { FEEDBACK_COMMENT_MAX_LENGTH } from '../types/feedback'

export function MissingReferencePrompt() {
  const { activeSession, submitMissingReferenceFeedback } = useFeedback()
  const [text, setText] = useState(activeSession?.missingReferenceText ?? '')
  const [saved, setSaved] = useState(Boolean(activeSession?.missingReferenceText))
  if (!activeSession?.noSuitableReference) return null

  return (
    <section className="surface mx-auto mt-5 max-w-3xl border-sky-100 p-5 sm:p-6" aria-labelledby="missing-reference-title">
      <p className="eyebrow">Помогите улучшить библиотеку</p>
      <h2 id="missing-reference-title" className="mt-2 text-xl font-semibold text-navy">Какого референса вам не хватило?</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Например: «Строгий dashboard с 8 KPI для директора» или «Красивый timeline проекта на 12 месяцев».</p>
      <label className="mt-4 block text-sm font-semibold text-navy">
        Описание (необязательно)
        <textarea value={text} onChange={(event) => { setText(event.target.value.slice(0, FEEDBACK_COMMENT_MAX_LENGTH)); setSaved(false) }} rows={4} maxLength={FEEDBACK_COMMENT_MAX_LENGTH} placeholder="Опишите, какой слайд вы хотели увидеть" className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-4 py-3 font-normal text-navy" />
      </label>
      <div className="mt-2 flex justify-between gap-3 text-xs text-muted"><span>Не указывайте персональные данные.</span><span className="shrink-0 tabular-nums">{text.length} / {FEEDBACK_COMMENT_MAX_LENGTH}</span></div>
      <div className="mt-4 flex flex-wrap items-center gap-4"><button type="button" disabled={!text.trim()} onClick={() => { submitMissingReferenceFeedback(text); setSaved(true) }} className="btn-primary">Сохранить ответ</button>{saved && <span role="status" className="text-sm font-semibold text-success">Ответ сохранён</span>}</div>
    </section>
  )
}
