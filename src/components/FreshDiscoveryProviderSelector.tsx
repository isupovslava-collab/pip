import { useEffect, useMemo, useRef, useState } from 'react'
import { freshDiscoveryProviders, getFreshDiscoveryProvider, type FreshDiscoveryProvider, type FreshDiscoveryProviderId } from '../data/freshDiscoveryProviders'
import { useFeedback } from '../hooks/useFeedback'
import { generateFreshDiscoveryPrompt } from '../lib/freshDiscovery/generateFreshDiscoveryPrompt'
import { buildFreshDiscoveryTestSummary } from '../lib/freshDiscovery/buildFreshDiscoveryTestSummary'
import type { FreshDiscoveryUsefulReferenceCount, FreshDiscoveryVisualQuality, FreshDiscoveryWouldUseAgain } from '../types/feedback'
import type { SearchQuery } from '../types/reference'
import { copyTextToClipboard } from '../utils/clipboard'
import { Icon } from './Icon'

interface Props { open: boolean; onClose: () => void; query: SearchQuery; testMode: boolean }
type CopyState = 'idle' | 'copied' | 'failed'

export function FreshDiscoveryProviderSelector({ open, onClose, query, testMode }: Props) {
  const feedback = useFeedback()
  const prompt = useMemo(() => generateFreshDiscoveryPrompt(query), [query])
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [selectedProviderId, setSelectedProviderId] = useState<FreshDiscoveryProviderId | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
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

  const copyPrompt = async (providerId?: FreshDiscoveryProviderId) => {
    try {
      await copyTextToClipboard(prompt)
      setCopyState('copied')
      feedback.recordFreshDiscoveryPromptCopied(query)
    } catch {
      setCopyState('failed')
      setPreviewOpen(true)
      feedback.recordFreshDiscoveryProviderEvent('fresh_discovery_prompt_copy_failed', query, providerId)
    }
  }

  const chooseProvider = (provider: FreshDiscoveryProvider) => {
    setSelectedProviderId(provider.id)
    setCopyState('idle')
    setPopupBlocked(false)
    feedback.recordFreshDiscoveryProviderEvent('fresh_discovery_provider_selected', query, provider.id)
    if (provider.url) {
      const openedWindow = window.open(provider.url, '_blank', 'noopener,noreferrer')
      const blocked = openedWindow === null
      setPopupBlocked(blocked)
      feedback.recordFreshDiscoveryProviderEvent(blocked ? 'fresh_discovery_provider_open_failed' : 'fresh_discovery_provider_opened', query, provider.id)
    }
    void copyPrompt(provider.id)
  }

  const selectedProvider = selectedProviderId ? getFreshDiscoveryProvider(selectedProviderId) : null
  const session = feedback.activeSession

  return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-0 sm:items-center sm:justify-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="fresh-provider-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
      <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-7">
        <div><p className="eyebrow">Fresh Discovery 2.5</p><h2 id="fresh-provider-title" className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Где искать свежие референсы?</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">PIP скопирует подготовленный запрос и откроет выбранный AI-сервис. Вставьте промпт в новом окне и запустите поиск.</p></div>
        <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-xl text-muted hover:bg-slate-50" aria-label="Закрыть выбор AI-сервиса">×</button>
      </div>
      <div className="p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2" aria-label="AI-сервисы">
          {freshDiscoveryProviders.map((provider) => <button key={provider.id} type="button" onClick={() => chooseProvider(provider)} aria-label={`Выбрать ${provider.label}`} className={`min-h-14 rounded-xl border px-5 py-3 text-left font-semibold transition focus-visible:outline ${selectedProviderId === provider.id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-bright hover:bg-sky-50'}`}><span className="flex items-center justify-between gap-3"><span>{provider.label}</span><span aria-hidden="true">{provider.supportsOpen ? '↗' : '⧉'}</span></span></button>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted">Доступность функций интернет-поиска зависит от выбранного AI-сервиса, аккаунта и его текущих возможностей.</p>

        {selectedProvider && <div className="mt-5 rounded-2xl border border-line bg-slate-50 p-4" role="status" aria-live="polite">
          {copyState === 'copied' && <><p className="font-semibold text-emerald-800">{selectedProvider.id === 'other' ? 'Промпт скопирован. Вставьте его в нейросеть с доступом к интернету.' : 'Промпт скопирован. Вставьте его в открывшемся AI-сервисе и запустите поиск.'}</p>{selectedProvider.supportsOpen && <p className="mt-2 inline-flex rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold text-navy">Ctrl+V → Enter</p>}</>}
          {copyState === 'failed' && <><p className="font-semibold text-red-800">Не удалось скопировать промпт автоматически.</p><button type="button" onClick={() => void copyPrompt(selectedProvider.id)} className="btn-secondary mt-3"><Icon name="copy" className="h-4 w-4" />Скопировать ещё раз</button></>}
          {popupBlocked && selectedProvider.url && <div className="mt-3 border-t border-line pt-3"><p className="font-semibold text-amber-900">Не удалось открыть новую вкладку.</p><a href={selectedProvider.url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3">Открыть {selectedProvider.label}<span aria-hidden="true">↗</span></a></div>}
        </div>}

        <button type="button" onClick={() => setPreviewOpen((value) => !value)} aria-expanded={previewOpen} className="btn-ghost mt-4 px-0">{previewOpen ? 'Скрыть промпт' : 'Посмотреть промпт'}</button>
        {previewOpen && <div className="mt-2"><h3 className="font-semibold text-navy">Предпросмотр промпта</h3><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-line bg-slate-50 p-4 text-xs leading-5 text-navy">{prompt}</pre></div>}

        {selectedProvider && <FreshDiscoveryPostSearchFeedback testMode={testMode} usefulReferenceCount={session?.freshDiscoveryUsefulReferenceCount ?? null} visualQuality={session?.freshDiscoveryVisualQuality ?? null} wouldUseAgain={session?.freshDiscoveryWouldUseAgain ?? null} onChange={feedback.submitFreshDiscoveryPostSearchFeedback} onCopySummary={async () => {
          if (!selectedProviderId) return
          const text = buildFreshDiscoveryTestSummary(query, selectedProviderId, session?.freshDiscoveryUsefulReferenceCount ?? null, session?.freshDiscoveryVisualQuality ?? null, session?.freshDiscoveryWouldUseAgain ?? null)
          try { await copyTextToClipboard(text); feedback.recordFreshDiscoveryTestSummaryCopied(query, selectedProviderId) } catch { /* Prompt remains local; a failed optional summary copy needs no extra field. */ }
        }} />}

        <p className="mt-5 border-t border-line pt-4 text-sm leading-6 text-muted"><strong className="text-navy">Внешний AI может ошибаться.</strong> Перед использованием проверьте первоисточник и конкретный слайд. Результаты внешнего AI-поиска не являются проверенными PIP-референсами.</p>
      </div>
    </section>
  </div>
}

function ChoiceGroup<T extends string>({ title, value, options, onSelect }: { title: string; value: T | null; options: Array<[T, string]>; onSelect: (value: T) => void }) {
  return <fieldset><legend className="font-semibold text-navy">{title}</legend><div className="mt-2 flex flex-wrap gap-2">{options.map(([id, label]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => onSelect(id)} className={`min-h-10 rounded-xl border px-3 py-2 text-sm font-semibold ${value === id ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy hover:text-navy'}`}>{label}</button>)}</div></fieldset>
}

function FreshDiscoveryPostSearchFeedback({ testMode, usefulReferenceCount, visualQuality, wouldUseAgain, onChange, onCopySummary }: { testMode: boolean; usefulReferenceCount: FreshDiscoveryUsefulReferenceCount | null; visualQuality: FreshDiscoveryVisualQuality | null; wouldUseAgain: FreshDiscoveryWouldUseAgain | null; onChange: (useful: FreshDiscoveryUsefulReferenceCount | null, visual: FreshDiscoveryVisualQuality | null, again: FreshDiscoveryWouldUseAgain | null) => void; onCopySummary: () => void }) {
  return <section className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 sm:p-5" aria-labelledby="post-search-title">
    <p className="eyebrow">После поиска</p><h3 id="post-search-title" className="mt-1 text-lg font-bold text-navy">Поделитесь результатом, если захотите</h3><p className="mt-1 text-sm text-muted">Ответы необязательны и сохраняются только в этом браузере.</p>
    <div className="mt-4 space-y-5">
      <ChoiceGroup title="Удалось найти полезные референсы?" value={usefulReferenceCount} options={[["0", "0"], ["1_2", "1–2"], ["3_4", "3–4"], ["5_plus", "5+"]]} onSelect={(value) => onChange(value, visualQuality, wouldUseAgain)} />
      <ChoiceGroup title="Хотели бы вы использовать Fresh Discovery снова?" value={wouldUseAgain} options={[["yes", "Да"], ["maybe", "Возможно"], ["no", "Нет"]]} onSelect={(value) => onChange(usefulReferenceCount, visualQuality, value)} />
      {testMode && <ChoiceGroup title="Как вы оцениваете визуальное качество найденных референсов?" value={visualQuality} options={[["strong", "Сильные / есть WOW"], ["good", "Хорошие"], ["average", "Средние"], ["weak", "Слабые"]]} onSelect={(value) => onChange(usefulReferenceCount, value, wouldUseAgain)} />}
    </div>
    {testMode && usefulReferenceCount && wouldUseAgain && <button type="button" onClick={onCopySummary} className="btn-secondary mt-5"><Icon name="copy" className="h-4 w-4" />Скопировать краткий отчёт теста</button>}
  </section>
}
