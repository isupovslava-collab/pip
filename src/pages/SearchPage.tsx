import { useLocation } from 'react-router-dom'
import { CollectionFeedback } from '../components/CollectionFeedback'
import { labels } from '../data/dictionaries'
import { rankReferences, summarizeContentMatches } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchWizard } from '../components/SearchWizard'
import { Icon } from '../components/Icon'
import { useFeedback } from '../hooks/useFeedback'
import { isTestMode } from '../utils/testMode'
import { MissingReferencePrompt } from '../components/MissingReferencePrompt'
import { FreshDiscoveryPrompt } from '../components/FreshDiscoveryPrompt'

interface SearchPageProps {
  references: Reference[]
  query: SearchQuery | null
  setQuery: (query: SearchQuery | null) => void
}

export function SearchPage({ references, query, setQuery }: SearchPageProps) {
  const feedback = useFeedback()
  const location = useLocation()
  const testMode = isTestMode(location.search)
  if (!query) return <SearchWizard onStart={feedback.startSession} onSearch={(nextQuery) => {
    const nextResults = rankReferences(references, nextQuery).slice(0, 6)
    feedback.completeWizard(nextQuery, nextResults)
    setQuery(nextQuery)
  }} />
  const results = rankReferences(references, query).slice(0, 6)
  const matchSummary = summarizeContentMatches(results)
  const selectedLabels = [labels.scenario[query.scenarioId], labels.persona[query.personaId], labels.goal[query.goalId], labels.style[query.styleId]]

  return (
    <section aria-labelledby="results-title" aria-live="polite">
      <div className="surface relative mb-8 overflow-hidden p-5 sm:p-8">
        <div className="absolute right-0 top-0 h-full w-1 bg-bright" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow flex items-center gap-2"><Icon name="insight" className="h-4 w-4" />Результаты подбора</p>
            <h1 id="results-title" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Подходящие решения</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-muted">Мы подобрали варианты дизайна для выбранного типа слайда и ранжировали их по соответствию вашей задаче.</p>
          </div>
          <button type="button" onClick={() => setQuery(null)} className="btn-secondary shrink-0"><Icon name="edit" className="h-4 w-4" />Изменить параметры</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Выбранные параметры">
          {selectedLabels.map((label) => <span key={label} className="chip"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-bright" />{label}</span>)}
          <span className="chip font-semibold"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber" />Тип слайда: {labels.contentType[query.contentTypeId]}</span>
        </div>
      </div>
      {matchSummary.exactCount < 4 && <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950" role="status">Точных вариантов пока немного. Мы добавили несколько близких форматов, которые могут помочь решить вашу задачу.</div>}
      <ResultsGrid references={results} bestReferenceId={feedback.activeSession?.bestReferenceId} onSelectBest={feedback.selectBestReference} />
      <FreshDiscoveryPrompt query={query} testMode={testMode} />
      <div className="mt-6 flex justify-center"><button type="button" aria-pressed={feedback.activeSession?.noSuitableReference ?? false} onClick={feedback.selectNoSuitableReference} className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${feedback.activeSession?.noSuitableReference ? 'border-navy bg-navy text-white' : 'border-line bg-white text-muted hover:border-navy hover:text-navy'}`}>{feedback.activeSession?.noSuitableReference ? '✓ ' : ''}Нет подходящего варианта</button></div>
      <MissingReferencePrompt />
      <CollectionFeedback testMode={testMode} />
    </section>
  )
}
