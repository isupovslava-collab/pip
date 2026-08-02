import { useState } from 'react'
import { contentTypes, goals, personas, scenarios, styles } from '../data/dictionaries'
import type { SearchQuery } from '../types/reference'
import { Icon } from './Icon'
import { WizardStep } from './WizardStep'

interface SearchWizardProps {
  initialQuery?: SearchQuery | null
  onSearch: (query: SearchQuery) => void
  onStart?: () => void
}

const steps = [
  { key: 'scenarioId', title: 'Что вы готовите?', options: scenarios },
  { key: 'personaId', title: 'Кто основная аудитория?', options: personas },
  { key: 'goalId', title: 'Какой результат нужен?', options: goals },
  { key: 'styleId', title: 'Какое визуальное направление ближе?', options: styles },
  {
    key: 'contentTypeId',
    title: 'Какой слайд вы хотите подобрать?',
    description: 'Выберите основной формат. PIP покажет несколько вариантов дизайна именно для такого слайда.',
    options: contentTypes,
  },
] as const

export function SearchWizard({ initialQuery, onSearch, onStart }: SearchWizardProps) {
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
    <section className="mx-auto max-w-6xl" aria-labelledby="wizard-title">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-navy px-5 py-8 text-white shadow-lift sm:px-9 sm:py-10 lg:grid lg:grid-cols-[1fr_320px] lg:items-center lg:gap-10 lg:px-12">
        <div className="relative z-10">
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-bright"><Icon name="sparkles" className="h-4 w-4" />Подбор референсов</p>
          <h1 id="wizard-title" className="max-w-3xl text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-[3.35rem]">Найдите подходящее решение для вашей презентации</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Ответьте на пять коротких вопросов — PIP подберет наиболее подходящие референсы и объяснит свой выбор.</p>
        </div>
        <div className="relative mt-8 hidden h-48 lg:block" aria-hidden="true">
          <div className="absolute inset-0 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-inner">
            <div className="flex items-center justify-between"><span className="h-2 w-20 rounded-full bg-white/20" /><span className="h-8 w-14 rounded-lg bg-amber/90" /></div>
            <div className="mt-6 flex h-24 items-end gap-3 border-b border-white/15 px-2 pb-0">
              {[42, 66, 52, 86, 72].map((height, index) => <span key={height} className={`w-full rounded-t-md ${index === 3 ? 'bg-bright' : 'bg-white/20'}`} style={{ height: `${height}%` }} />)}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-300"><span className="h-2 w-2 rounded-full bg-amber" />Релевантность решений</div>
          </div>
        </div>
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[36px] border-bright/10" aria-hidden="true" />
      </div>
      <div className="surface p-5 sm:p-8 lg:p-10">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-blue">Шаг {step + 1} из 5</span>
            <span className="text-sm text-muted">{Math.round(((step + 1) / 5) * 100)}% пути</span>
          </div>
          <div className="grid grid-cols-5 gap-2" aria-hidden="true">
            {steps.map((item, index) => <span key={item.key} className={`h-2 rounded-full transition-colors duration-200 ${index <= step ? 'bg-blue' : 'bg-slate-100'}`} />)}
          </div>
        </div>
        <WizardStep
          title={current.title}
          description={'description' in current ? current.description : undefined}
          options={current.options}
          selected={selected}
          onSelect={(id) => {
            if (step === 0 && !query.scenarioId) onStart?.()
            setQuery((value) => ({ ...value, [current.key]: id }))
          }}
        />
        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
          <button type="button" onClick={reset} className="btn-ghost">Начать заново</button>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {step > 0 ? <button type="button" onClick={() => setStep((value) => value - 1)} className="btn-secondary"><Icon name="arrow-left" className="h-4 w-4" />Назад</button> : <span className="hidden sm:block" />}
            {step < 4 ? (
              <button type="button" disabled={!selected} onClick={next} className="btn-primary col-start-2">Далее<Icon name="arrow-right" className="h-4 w-4" /></button>
            ) : (
              <button type="button" disabled={!selected} onClick={() => onSearch(query as SearchQuery)} className="btn-primary col-span-2 bg-blue px-6 sm:col-auto"><Icon name="insight" className="h-4 w-4" />Показать рекомендации</button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
