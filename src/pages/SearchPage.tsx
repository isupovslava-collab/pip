import { labels } from '../data/dictionaries'
import { rankReferences } from '../services/rankReferences'
import type { Reference, SearchQuery } from '../types/reference'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchWizard } from '../components/SearchWizard'

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
      <div className="mb-8 rounded-2xl border border-line bg-white p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue">Результаты подбора</p>
            <h1 id="results-title" className="mt-2 text-3xl font-black text-navy sm:text-4xl">Подходящие решения</h1>
            <p className="mt-2 text-muted">Мы сравнили вашу задачу с 12 демонстрационными референсами.</p>
          </div>
          <button type="button" onClick={() => setQuery(null)} className="min-h-11 rounded-lg border border-line px-5 font-bold text-navy hover:border-blue">Изменить параметры</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Выбранные параметры">
          {selectedLabels.map((label) => <span key={label} className="rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-blue">{label}</span>)}
        </div>
      </div>
      <ResultsGrid references={results} />
    </section>
  )
}
