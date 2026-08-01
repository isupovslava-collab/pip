import { useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import type { CollectionRating, UsableReferenceFound } from '../types/feedback'

const ratingOptions: Array<{ value: CollectionRating; label: string }> = [
  { value: 'useful', label: '👍 Полезная' },
  { value: 'partially_useful', label: '😐 Частично полезная' },
  { value: 'not_useful', label: '👎 Не подходит' },
]

const issueOptions = [
  'Результаты не соответствуют моей задаче', 'Не подходит визуальный стиль', 'Слайды слишком похожи друг на друга',
  'Не хватает профессиональных референсов', 'Непонятно, почему выбраны эти варианты', 'Не хватает подходящего типа слайда', 'Другое',
]

const usableOptions: Array<{ value: UsableReferenceFound; label: string }> = [
  { value: 'yes', label: 'Да' }, { value: 'probably_yes', label: 'Скорее да' },
  { value: 'probably_no', label: 'Скорее нет' }, { value: 'no', label: 'Нет' },
]

export function CollectionFeedback({ testMode }: { testMode: boolean }) {
  const { activeSession, submitCollectionFeedback } = useFeedback()
  const [rating, setRating] = useState<CollectionRating | null>(activeSession?.collectionRating ?? null)
  const [issues, setIssues] = useState<string[]>(activeSession?.collectionIssues ?? [])
  const [comment, setComment] = useState(activeSession?.collectionComment ?? '')
  const [usable, setUsable] = useState<UsableReferenceFound | null>(activeSession?.usableReferenceFound ?? null)
  const [saved, setSaved] = useState(Boolean(activeSession?.completedAt))

  if (!activeSession?.query) return null
  const toggleIssue = (issue: string) => setIssues((current) => current.includes(issue) ? current.filter((item) => item !== issue) : [...current, issue])

  return (
    <section className="surface mt-8 p-5 sm:p-7" aria-labelledby="collection-feedback-title">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div><p className="eyebrow">Короткий отзыв</p><h2 id="collection-feedback-title" className="mt-2 text-xl font-semibold text-navy">Насколько полезна эта подборка?</h2></div>
        <span className="text-xs text-muted">Анонимно · хранится на этом устройстве</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {ratingOptions.map((option) => <button key={option.value} type="button" aria-pressed={rating === option.value} onClick={() => { setRating(option.value); setSaved(false) }} className={rating === option.value ? 'btn-primary' : 'btn-secondary'}>{option.label}</button>)}
      </div>
      {rating && <div className="mt-6 border-t border-line pt-6">
        <fieldset><legend className="font-semibold text-navy">Что можно улучшить?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">
          {issueOptions.map((issue) => <label key={issue} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-slate-50 px-3 py-3 text-sm text-muted"><input type="checkbox" checked={issues.includes(issue)} onChange={() => { toggleIssue(issue); setSaved(false) }} className="mt-0.5 h-4 w-4 accent-sky-600" /><span>{issue}</span></label>)}
        </div></fieldset>
        <fieldset className="mt-6"><legend className="font-semibold text-navy">Нашли ли вы среди результатов вариант, который могли бы использовать как референс?</legend><div className="mt-3 flex flex-wrap gap-2">
          {usableOptions.map((option) => <label key={option.value} className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold ${usable === option.value ? 'border-blue bg-sky-50 text-navy' : 'border-line bg-white text-muted'}`}><input type="radio" name="usable-reference" value={option.value} checked={usable === option.value} onChange={() => { setUsable(option.value); setSaved(false) }} className="sr-only" />{option.label}</label>)}
        </div></fieldset>
        <label className="mt-6 block text-sm font-semibold text-navy">Комментарий (необязательно)<textarea value={comment} onChange={(event) => { setComment(event.target.value); setSaved(false) }} rows={3} maxLength={1000} placeholder="Что особенно помогло или помешало?" className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 font-normal text-navy" /></label>
        <p className="mt-2 text-xs text-muted">Не указывайте в комментарии персональные данные.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4"><button type="button" disabled={!usable} onClick={() => { if (rating && usable) { submitCollectionFeedback(rating, issues, comment.trim(), usable); setSaved(true) } }} className="btn-primary">Сохранить отзыв</button>{saved && <p role="status" className="text-sm font-semibold text-success">{testMode ? 'Спасибо. Ваш отзыв сохранён на этом устройстве.' : 'Отзыв сохранён на этом устройстве.'}</p>}</div>
      </div>}
    </section>
  )
}
