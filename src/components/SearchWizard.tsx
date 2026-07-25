import { useState } from 'react'
import { contentTypes, goals, personas, scenarios, styles } from '../data/dictionaries'
import type { SearchQuery } from '../types/reference'
import { WizardStep } from './WizardStep'

interface SearchWizardProps {
  initialQuery?: SearchQuery | null
  onSearch: (query: SearchQuery) => void
}

const steps = [
  { key: 'scenarioId', title: 'Что вы готовите?', options: scenarios },
  { key: 'personaId', title: 'Кто основная аудитория?', options: personas },
  { key: 'goalId', title: 'Какой результат нужен?', options: goals },
  { key: 'styleId', title: 'Какое визуальное направление ближе?', options: styles },
  { key: 'contentTypeId', title: 'Какой контент будет главным?', options: contentTypes },
] as const

export function SearchWizard({ initialQuery, onSearch }: SearchWizardProps) {
  const [step, setStep] = useState(0)
  const [query, setQuery] = useState<Partial<SearchQuery>>(initialQuery ?? {})
  const current = steps[step]
  const selected = query[current.key]

  const reset = () => {
    setQuery({})
    setStep(0)
  }

  const next = () => {
    if (!selected) return
    if (step < steps.length - 1) setStep((value) => value + 1)
  }

  return (
    <section className="mx-auto max-w-5xl" aria-labelledby="wizard-title">
      <div className="mb-8 text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue">Подбор референсов</p>
        <h1 id="wizard-title" className="text-3xl font-black tracking-tight text-navy sm:text-5xl">Найдите подходящее решение для вашей презентации</h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">Ответьте на пять коротких вопросов — PIP подберет наиболее подходящие референсы и объяснит свой выбор.</p>
      </div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-8">
        <div className="mb-7 flex items-center gap-4">
          <span className="whitespace-nowrap text-sm font-bold text-blue">Шаг {step + 1} из 5</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full bg-blue transition-[width]" style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
        </div>
        <WizardStep
          title={current.title}
          options={current.options}
          selected={selected}
          onSelect={(id) => setQuery((value) => ({ ...value, [current.key]: id }))}
        />
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <button type="button" onClick={reset} className="min-h-11 rounded-lg px-3 font-semibold text-muted hover:bg-slate-100">Начать заново</button>
          <div className="flex gap-2">
            {step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} className="min-h-11 rounded-lg border border-line px-5 font-bold text-navy hover:bg-slate-50">Назад</button>}
            {step < 4 ? (
              <button type="button" disabled={!selected} onClick={next} className="min-h-11 rounded-lg bg-blue px-6 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Далее</button>
            ) : (
              <button type="button" disabled={!selected} onClick={() => onSearch(query as SearchQuery)} className="min-h-11 rounded-lg bg-amber px-6 font-bold text-navy disabled:cursor-not-allowed disabled:opacity-40">Показать рекомендации</button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
