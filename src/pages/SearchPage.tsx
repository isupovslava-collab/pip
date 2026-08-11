import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CollectionFeedback } from '../components/CollectionFeedback'
import { CuratedCoreSection } from '../components/CuratedCoreSection'
import { FreshDiscoveryPrompt } from '../components/FreshDiscoveryPrompt'
import { FreshDiscoveryProviderSelector } from '../components/FreshDiscoveryProviderSelector'
import { Icon } from '../components/Icon'
import { MissingReferencePrompt } from '../components/MissingReferencePrompt'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchWizard } from '../components/SearchWizard'
import { labels } from '../data/dictionaries'
import { useFeedback } from '../hooks/useFeedback'
import { rankReferences } from '../services/rankReferences'
import { selectCuratedCore } from '../services/selectCuratedCore'
import type { ContentTypeId, Reference, SearchQuery } from '../types/reference'
import { isTestMode } from '../utils/testMode'

interface SearchPageProps { references: Reference[]; query: SearchQuery | null; setQuery: (query: SearchQuery | null) => void }

const goodReferenceGuidance: Record<ContentTypeId, string[]> = {
  kpi: ['3–6 ключевых показателей', 'ясная динамика или plan/fact', 'один управленческий вывод'],
  comparison: ['единые критерии', '2–4 различимых варианта', 'визуально ясная рекомендация'],
  timeline: ['этапы и сроки', 'контрольные точки и статусы', 'логика движения к результату'],
  process: ['понятная последовательность', 'входы, решения и владельцы', 'наблюдаемый результат каждого шага'],
  dashboard: ['несколько связанных метрик', 'тренды, статусы и отклонения', 'приоритеты для управленческого внимания'],
  cover: ['одна сильная тема', 'выразительный opening visual', 'минимум второстепенного текста'],
  story: ['ясный тезис', 'причинно-следственная аргументация', 'убедительный вывод'],
  table: ['читаемая на экране структура', 'согласованные столбцы и статусы', 'выделенный вывод или решение'],
}

export function SearchPage({ references, query, setQuery }: SearchPageProps) {
  const feedback = useFeedback()
  const location = useLocation()
  const testMode = isTestMode(location.search)
  const [providerSelectorOpen, setProviderSelectorOpen] = useState(false)
  const [editingQuery, setEditingQuery] = useState<SearchQuery | null>(null)

  if (!query) return <SearchWizard initialQuery={editingQuery} onStart={feedback.startSession} onSearch={(nextQuery) => {
    const curated = selectCuratedCore(references, nextQuery)
    feedback.completeWizard(nextQuery, curated)
    setEditingQuery(nextQuery)
    setQuery(nextQuery)
  }} />

  const curated = selectCuratedCore(references, query)
  const legacy = testMode ? rankReferences(references, query).slice(0, 6) : []
  const selectedLabels = [labels.scenario[query.scenarioId], labels.persona[query.personaId], labels.goal[query.goalId], labels.style[query.styleId]]
  const openProviderSelector = () => {
    feedback.recordFreshDiscoveryProviderEvent('fresh_discovery_provider_selector_opened', query)
    setProviderSelectorOpen(true)
  }

  return <section aria-labelledby="results-title" aria-live="polite">
    <div className="surface relative mb-8 overflow-hidden p-5 sm:p-8">
      <div className="absolute right-0 top-0 h-full w-1 bg-bright" aria-hidden="true" />
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="eyebrow flex items-center gap-2"><Icon name="insight" className="h-4 w-4" />Результаты подбора</p><h1 id="results-title" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Подходящие решения</h1><p className="mt-2 max-w-4xl text-base leading-7 text-muted">Мы показываем только те PIP-референсы, которые точно соответствуют выбранному типу слайда и прошли визуальный отбор. Дополнительные свежие примеры можно найти через AI.</p></div><button type="button" onClick={() => { setEditingQuery(query); setQuery(null) }} className="btn-secondary shrink-0"><Icon name="edit" className="h-4 w-4" />Изменить параметры</button></div>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Выбранные параметры">{selectedLabels.map((label) => <span key={label} className="chip"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-bright" />{label}</span>)}<span className="chip font-semibold"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber" />Тип слайда: {labels.contentType[query.contentTypeId]}</span></div>
    </div>

    <CuratedCoreSection references={curated} query={query} onOpenFreshDiscovery={openProviderSelector} />
    <FreshDiscoveryPrompt query={query} onOpenProviderSelector={openProviderSelector} />

    <section className="surface mt-8 p-5 sm:p-7" aria-labelledby="good-reference-title"><p className="eyebrow">Presentation guidance</p><h2 id="good-reference-title" className="mt-2 text-2xl font-bold text-navy">Как выглядит сильный слайд этого типа</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{goodReferenceGuidance[query.contentTypeId].map((item, index) => <div key={item} className="rounded-2xl bg-slate-50 p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 text-sm font-bold text-blue">{index + 1}</span><p className="mt-3 font-semibold leading-6 text-navy">{item}</p></div>)}</div></section>

    {testMode && <details className="surface mt-8 p-5 sm:p-7"><summary className="cursor-pointer font-bold text-navy">Показать прежние варианты</summary><p className="mt-2 text-sm text-muted">Legacy / diagnostic only. Внутренние score и старая exact/compatible/fallback логика сохранены для сравнения.</p><div className="mt-5"><ResultsGrid references={legacy} bestReferenceId={feedback.activeSession?.bestReferenceId} onSelectBest={feedback.selectBestReference} /></div></details>}

    <div className="mt-6 flex justify-center"><button type="button" aria-pressed={feedback.activeSession?.noSuitableReference ?? false} onClick={feedback.selectNoSuitableReference} className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${feedback.activeSession?.noSuitableReference ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy hover:text-navy'}`}>{feedback.activeSession?.noSuitableReference ? '✓ ' : ''}Нет подходящего варианта</button></div>
    <MissingReferencePrompt />
    <CollectionFeedback testMode={testMode} />
    <FreshDiscoveryProviderSelector open={providerSelectorOpen} onClose={() => setProviderSelectorOpen(false)} query={query} testMode={testMode} />
  </section>
}
