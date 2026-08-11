import { useEffect, useMemo, useRef, useState } from 'react'
import { freshDiscoveryProviders, getFreshDiscoveryProvider, type FreshDiscoveryProvider, type FreshDiscoveryProviderId } from '../data/freshDiscoveryProviders'
import { useFeedback } from '../hooks/useFeedback'
import { buildFreshDiscoveryTestSummary } from '../lib/freshDiscovery/buildFreshDiscoveryTestSummary'
import { generateFreshDiscoveryPrompt } from '../lib/freshDiscovery/generateFreshDiscoveryPrompt'
import type { FreshDiscoveryDiversity, FreshDiscoveryLinkQuality, FreshDiscoveryUsefulReferenceCount, FreshDiscoveryVisualQuality, FreshDiscoveryWouldUseAgain } from '../types/feedback'
import type { SearchQuery } from '../types/reference'
import { copyTextToClipboard } from '../utils/clipboard'
import { Icon } from './Icon'

interface Props { open: boolean; onClose: () => void; query: SearchQuery; testMode: boolean }
type CopyState = 'idle' | 'copied' | 'failed'

export function FreshDiscoveryProviderSelector({ open, onClose, query, testMode }: Props) {
  const feedback = useFeedback()
  const prompt = useMemo(() => generateFreshDiscoveryPrompt(query), [query])
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const promptRef = useRef<HTMLPreElement>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [selectedProviderId, setSelectedProviderId] = useState<FreshDiscoveryProviderId | null>(null)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const copyPrompt = async () => {
    try {
      await copyTextToClipboard(prompt)
      setCopyState('copied')
      setPreviewOpen(false)
      feedback.recordFreshDiscoveryPromptCopied(query)
    } catch {
      setCopyState('failed')
      setPreviewOpen(true)
      feedback.recordFreshDiscoveryProviderEvent('fresh_discovery_prompt_copy_failed', query)
    }
  }

  const selectPrompt = () => {
    if (!promptRef.current) return
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(promptRef.current)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const openProvider = (provider: FreshDiscoveryProvider) => {
    setSelectedProviderId(provider.id)
    setPopupBlocked(false)
    feedback.recordFreshDiscoveryProviderEvent('fresh_discovery_provider_selected', query, provider.id)
    if (!provider.url) return
    const opened = window.open(provider.url, '_blank', 'noopener,noreferrer')
    const blocked = opened === null
    setPopupBlocked(blocked)
    feedback.recordFreshDiscoveryProviderEvent(blocked ? 'fresh_discovery_provider_open_failed' : 'fresh_discovery_provider_opened', query, provider.id)
  }

  const selectedProvider = selectedProviderId ? getFreshDiscoveryProvider(selectedProviderId) : null
  const session = feedback.activeSession

  return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-0 sm:items-center sm:justify-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="fresh-provider-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
      <header className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-7">
        <div><p className="eyebrow">Fresh Discovery v3</p><h2 id="fresh-provider-title" className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Найти свежие референсы через AI</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Сначала скопируйте точный запрос PIP. После подтверждения выберите AI-сервис и вставьте запрос туда.</p></div>
        <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-xl text-muted hover:bg-slate-50" aria-label="Закрыть выбор AI-сервиса">×</button>
      </header>
      <div className="p-5 sm:p-7">
        <section aria-labelledby="copy-step-title" className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5">
          <p className="eyebrow">Шаг 1</p><h3 id="copy-step-title" className="mt-1 text-lg font-bold text-navy">Скопируйте подготовленный запрос</h3>
          <button type="button" onClick={() => void copyPrompt()} className={`mt-4 w-full sm:w-auto ${copyState === 'copied' ? 'btn-primary' : 'btn-secondary'}`}><Icon name="copy" className="h-4 w-4" />{copyState === 'copied' ? 'Запрос скопирован' : copyState === 'failed' ? 'Повторить копирование' : 'Скопировать запрос'}</button>
          {copyState === 'copied' && <p className="mt-3 font-semibold text-emerald-800" role="status">Готово. Теперь откройте AI-сервис на шаге 2.</p>}
          {copyState === 'failed' && <div className="mt-4" role="alert"><p className="font-semibold text-red-800">Не удалось скопировать запрос автоматически. AI-сервис не открыт.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void copyPrompt()} className="btn-secondary"><Icon name="copy" className="h-4 w-4" />Повторить</button><button type="button" onClick={selectPrompt} className="btn-ghost">Выделить запрос</button></div></div>}
        </section>

        {copyState === 'copied' && <section className="mt-5" aria-labelledby="provider-step-title"><p className="eyebrow">Шаг 2</p><h3 id="provider-step-title" className="mt-1 text-lg font-bold text-navy">Откройте AI-сервис</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{freshDiscoveryProviders.map((provider) => <button key={provider.id} type="button" onClick={() => openProvider(provider)} aria-label={`${provider.supportsOpen ? 'Открыть' : 'Выбрать'} ${provider.label}`} className={`min-h-14 rounded-xl border px-5 py-3 text-left font-semibold transition focus-visible:outline ${selectedProviderId === provider.id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-bright hover:bg-sky-50'}`}><span className="flex items-center justify-between gap-3"><span>{provider.label}</span><span aria-hidden="true">{provider.supportsOpen ? '↗' : '⌘'}</span></span></button>)}</div><p className="mt-3 text-sm text-muted">Вставьте запрос в открывшийся сервис: <span className="font-mono font-bold text-navy">Ctrl+V → Enter</span></p></section>}

        {popupBlocked && selectedProvider?.url && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-950">Браузер заблокировал новую вкладку.</p><a href={selectedProvider.url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3">Открыть {selectedProvider.label}<span aria-hidden="true">↗</span></a></div>}

        <button type="button" onClick={() => setPreviewOpen((value) => !value)} aria-expanded={previewOpen} className="btn-ghost mt-4 px-0">{previewOpen ? 'Скрыть запрос' : 'Посмотреть запрос'}</button>
        {previewOpen && <div className="mt-2"><h3 className="font-semibold text-navy">Предпросмотр запроса</h3><pre ref={promptRef} tabIndex={0} className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-line bg-slate-50 p-4 text-xs leading-5 text-navy">{prompt}</pre></div>}

        {selectedProvider && <FreshDiscoveryPostSearchFeedback testMode={testMode} usefulReferenceCount={session?.freshDiscoveryUsefulReferenceCount ?? null} visualQuality={session?.freshDiscoveryVisualQuality ?? null} wouldUseAgain={session?.freshDiscoveryWouldUseAgain ?? null} linkQuality={session?.freshDiscoveryLinkQuality ?? null} diversity={session?.freshDiscoveryDiversity ?? null} onChange={feedback.submitFreshDiscoveryPostSearchFeedback} onCopySummary={async () => {
          if (!selectedProviderId) return
          const text = buildFreshDiscoveryTestSummary(query, selectedProviderId, session?.freshDiscoveryUsefulReferenceCount ?? null, session?.freshDiscoveryVisualQuality ?? null, session?.freshDiscoveryWouldUseAgain ?? null, session?.freshDiscoveryLinkQuality ?? null, session?.freshDiscoveryDiversity ?? null)
          try { await copyTextToClipboard(text); feedback.recordFreshDiscoveryTestSummaryCopied(query, selectedProviderId) } catch { /* Optional local summary only. */ }
        }} />}

        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted"><strong className="text-navy">Результаты зависят от выбранного AI-сервиса.</strong> Обязательно проверьте конкретный слайд, доступность ссылки и первоисточник. Результаты внешнего AI не являются проверенными PIP-референсами.</p>
      </div>
    </section>
  </div>
}

function ChoiceGroup<T extends string>({ title, value, options, onSelect }: { title: string; value: T | null; options: Array<[T, string]>; onSelect: (value: T) => void }) {
  return <fieldset><legend className="font-semibold text-navy">{title}</legend><div className="mt-2 flex flex-wrap gap-2">{options.map(([id, label]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onSelect(id)} className={`min-h-10 rounded-xl border px-3 py-2 text-sm font-semibold ${value === id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy hover:text-navy'}`}>{label}</button>)}</div></fieldset>
}

interface PostFeedbackProps {
  testMode: boolean
  usefulReferenceCount: FreshDiscoveryUsefulReferenceCount | null
  visualQuality: FreshDiscoveryVisualQuality | null
  wouldUseAgain: FreshDiscoveryWouldUseAgain | null
  linkQuality: FreshDiscoveryLinkQuality | null
  diversity: FreshDiscoveryDiversity | null
  onChange: (useful: FreshDiscoveryUsefulReferenceCount | null, visual: FreshDiscoveryVisualQuality | null, again: FreshDiscoveryWouldUseAgain | null, links: FreshDiscoveryLinkQuality | null, diversity: FreshDiscoveryDiversity | null) => void
  onCopySummary: () => void
}

function FreshDiscoveryPostSearchFeedback(props: PostFeedbackProps) {
  const { testMode, usefulReferenceCount, visualQuality, wouldUseAgain, linkQuality, diversity, onChange, onCopySummary } = props
  const update = (next: Partial<PostFeedbackProps>) => onChange(next.usefulReferenceCount ?? usefulReferenceCount, next.visualQuality ?? visualQuality, next.wouldUseAgain ?? wouldUseAgain, next.linkQuality ?? linkQuality, next.diversity ?? diversity)
  return <section className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 sm:p-5" aria-labelledby="post-search-title"><p className="eyebrow">После поиска</p><h3 id="post-search-title" className="mt-1 text-lg font-bold text-navy">Поделитесь результатом, если захотите</h3><p className="mt-1 text-sm text-muted">Ответы необязательны и сохраняются только в этом браузере.</p><div className="mt-4 space-y-5">
    <ChoiceGroup title="Удалось найти полезные референсы?" value={usefulReferenceCount} options={[["0", "0"], ["1_2", "1–2"], ["3_4", "3–4"], ["5_plus", "5+"]]} onSelect={(value) => update({ usefulReferenceCount: value })} />
    <ChoiceGroup title="Какая доля ссылок открывалась и вела на нужный материал?" value={linkQuality} options={[["all", "Все"], ["most", "Большинство"], ["less_than_half", "Меньше половины"], ["none", "Ни одна"]]} onSelect={(value) => update({ linkQuality: value })} />
    <ChoiceGroup title="Хотели бы вы использовать Fresh Discovery снова?" value={wouldUseAgain} options={[["yes", "Да"], ["maybe", "Возможно"], ["no", "Нет"]]} onSelect={(value) => update({ wouldUseAgain: value })} />
    {testMode && <><ChoiceGroup title="Как вы оцениваете визуальное качество?" value={visualQuality} options={[["strong", "Сильные / есть WOW"], ["good", "Хорошие"], ["average", "Средние"], ["weak", "Слабые"]]} onSelect={(value) => update({ visualQuality: value })} /><ChoiceGroup title="Насколько разнообразны композиции?" value={diversity} options={[["diverse", "Разнообразны"], ["some_duplicates", "Есть повторы"], ["too_similar", "Слишком похожи"]]} onSelect={(value) => update({ diversity: value })} /></>}
  </div>{testMode && usefulReferenceCount && wouldUseAgain && <button type="button" onClick={onCopySummary} className="btn-secondary mt-5"><Icon name="copy" className="h-4 w-4" />Скопировать краткий отчёт теста</button>}</section>
}
