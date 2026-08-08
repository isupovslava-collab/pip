import { useEffect, useMemo, useRef, useState } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import { generateFreshDiscoveryPrompt } from '../lib/freshDiscovery/generateFreshDiscoveryPrompt'
import type { FreshDiscoveryHelpful } from '../types/feedback'
import type { SearchQuery } from '../types/reference'
import { Icon } from './Icon'

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard copy failed.')
}

export function FreshDiscoveryPrompt({ query, testMode }: { query: SearchQuery; testMode: boolean }) {
  const feedback = useFeedback()
  const prompt = useMemo(() => generateFreshDiscoveryPrompt(query), [query])
  const tracked = useRef(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    feedback.recordFreshDiscoveryPromptShown(query)
  // One impression per mounted results view.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const copyPrompt = async () => {
    try {
      await copyText(prompt)
      setCopied(true)
      setCopyError(false)
      feedback.recordFreshDiscoveryPromptCopied(query)
    } catch {
      setCopyError(true)
    }
  }

  return (
    <section className="surface mt-8 overflow-hidden border-indigo-100" aria-labelledby="fresh-discovery-title">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><Icon name="sparkles" className="h-5 w-5" /></span><p className="eyebrow">Fresh AI Discovery · Pilot</p></div>
          <h2 id="fresh-discovery-title" className="mt-4 text-2xl font-bold tracking-tight text-navy sm:text-3xl">Найти ещё свежие референсы</h2>
          <p className="mt-2 max-w-3xl leading-7 text-muted">Хотите посмотреть дополнительные примеры, которых пока нет в библиотеке PIP? Мы подготовим запрос для AI-поиска с учётом вашей задачи.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <button type="button" onClick={copyPrompt} className="btn-primary"><Icon name="copy" className="h-4 w-4" />Скопировать промпт для AI-поиска</button>
          <button type="button" onClick={() => setPreviewOpen((open) => !open)} aria-expanded={previewOpen} className="btn-secondary">{previewOpen ? 'Скрыть промпт' : 'Посмотреть промпт'}</button>
        </div>
      </div>

      {(copied || copyError) && <div className={`border-t px-5 py-4 text-sm font-semibold sm:px-7 ${copyError ? 'border-red-100 bg-red-50 text-red-800' : 'border-emerald-100 bg-emerald-50 text-emerald-800'}`} role="status">{copyError ? 'Не удалось скопировать. Откройте промпт и скопируйте текст вручную.' : 'Промпт скопирован. Вставьте его в ChatGPT, Gemini, Perplexity или другую нейросеть с доступом к интернету.'}</div>}

      {previewOpen && <div className="border-t border-line bg-slate-50 p-5 sm:p-7"><h3 className="font-semibold text-navy">Предпросмотр промпта</h3><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-navy">{prompt}</pre><button type="button" onClick={copyPrompt} className="btn-primary mt-4"><Icon name="copy" className="h-4 w-4" />Скопировать промпт</button></div>}

      {testMode && copied && <FreshDiscoveryFeedback value={feedback.activeSession?.freshDiscoveryHelpful ?? null} onSelect={feedback.submitFreshDiscoveryFeedback} />}

      <div className="border-t border-indigo-100 bg-indigo-50/60 px-5 py-4 text-sm leading-6 text-indigo-950 sm:px-7"><strong>Свежий AI-поиск выполняется во внешнем сервисе.</strong> Проверяйте первоисточник и конкретную страницу перед использованием референса. Результаты не являются проверенными PIP-референсами; PIP не отправляет данные и не хранит найденные visuals.</div>
    </section>
  )
}

function FreshDiscoveryFeedback({ value, onSelect }: { value: FreshDiscoveryHelpful | null; onSelect: (value: FreshDiscoveryHelpful) => void }) {
  const options: Array<[FreshDiscoveryHelpful, string]> = [['yes', 'Да'], ['maybe', 'Возможно'], ['no', 'Нет']]
  return <section className="border-t border-line bg-white px-5 py-5 sm:px-7" aria-labelledby="fresh-feedback-title"><h3 id="fresh-feedback-title" className="font-semibold text-navy">Полезна ли вам возможность искать свежие референсы через AI?</h3><div className="mt-3 flex flex-wrap gap-2">{options.map(([id, label]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onSelect(id)} className={`min-h-10 rounded-xl border px-4 text-sm font-semibold ${value === id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy hover:text-navy'}`}>{label}</button>)}</div></section>
}
