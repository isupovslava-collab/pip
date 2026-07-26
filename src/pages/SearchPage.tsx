import { labels } from '../data/dictionaries'
import { rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchWizard } from '../components/SearchWizard'
import { Icon } from '../components/Icon'

interface SearchPageProps {
  references: Reference[]
  query: SearchQuery | null
  setQuery: (query: SearchQuery | null) => void
}

export function SearchPage({ references, query, setQuery }: SearchPageProps) {
  if (!query) return <SearchWizard onSearch={setQuery} />
  const results = rankReferences(references, query).slice(0, 6)
  const selectedLabels = [labels.scenario[query.scenarioId], labels.persona[query.personaId], labels.goal[query.goalId], labels.style[query.styleId], labels.contentType[query.contentTypeId]]

  return (
    <section aria-labelledby="results-title" aria-live="polite">
      <div className="surface relative mb-8 overflow-hidden p-5 sm:p-8">
        <div className="absolute right-0 top-0 h-full w-1 bg-bright" aria-hidden="true" />
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow flex items-center gap-2"><Icon name="insight" className="h-4 w-4" />Результаты подбора</p>
            <h1 id="results-title" className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">Подходящие решения</h1>
            <p className="mt-2 text-base leading-7 text-muted">Мы сравнили вашу задачу с {references.length} референсами и ранжировали лучшие совпадения.</p>
          </div>
          <button type="button" onClick={() => setQuery(null)} className="btn-secondary shrink-0"><Icon name="edit" className="h-4 w-4" />Изменить параметры</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Выбранные параметры">
          {selectedLabels.map((label) => <span key={label} className="chip"><span className="mr-2 h-1.5 w-1.5 rounded-full bg-bright" />{label}</span>)}
        </div>
      </div>
      <ResultsGrid references={results} />
    </section>
  )
}
