import { useEffect, useRef } from 'react'
import { useFeedback } from '../hooks/useFeedback'
import type { SearchQuery } from '../types/reference'
import { Icon } from './Icon'

export function FreshDiscoveryPathChoice({ onOpenProviderSelector, onShowPipResults }: { onOpenProviderSelector: () => void; onShowPipResults: () => void }) {
  return <section className="surface mb-6 p-5 sm:p-6" aria-labelledby="reference-path-title">
    <h2 id="reference-path-title" className="text-xl font-bold text-navy sm:text-2xl">Выберите, где посмотреть референсы</h2>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-line bg-slate-50 p-5">
        <p className="eyebrow">PIP Library</p>
        <h3 className="mt-2 text-lg font-bold text-navy">Варианты из библиотеки PIP</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Подобранные PIP варианты для вашей задачи.</p>
        <button type="button" onClick={onShowPipResults} className="btn-secondary mt-4 w-full sm:w-auto">Смотреть варианты PIP</button>
      </div>
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
        <p className="eyebrow">Fresh Discovery</p>
        <h3 className="mt-2 text-lg font-bold text-navy">Свежий поиск через AI</h3>
        <p className="mt-2 text-sm leading-6 text-muted">Получите дополнительные актуальные примеры из интернета на момент запроса.</p>
        <button type="button" onClick={onOpenProviderSelector} className="btn-primary mt-4 w-full sm:w-auto"><Icon name="sparkles" className="h-4 w-4" />Найти свежие референсы</button>
      </div>
    </div>
    <p className="mt-4 text-sm leading-6 text-muted"><strong className="text-navy">Внешний AI может ошибаться.</strong> Перед использованием проверьте первоисточник и конкретный слайд.</p>
  </section>
}

export function FreshDiscoveryPrompt({ query, onOpenProviderSelector }: { query: SearchQuery; onOpenProviderSelector: () => void }) {
  const feedback = useFeedback()
  const tracked = useRef(false)
  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    feedback.recordFreshDiscoveryPromptShown(query)
  // One impression per mounted results view.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return <section className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-6" aria-labelledby="fresh-discovery-repeat-title">
    <div><p className="eyebrow">Fresh Discovery v3</p><h2 id="fresh-discovery-repeat-title" className="mt-1 text-xl font-bold text-navy">Нужны дополнительные актуальные примеры?</h2><p className="mt-1 text-sm leading-6 text-muted">Скопируйте строгий exact-type запрос, затем откройте выбранный AI-сервис.</p></div>
    <button type="button" onClick={onOpenProviderSelector} className="btn-primary mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"><Icon name="sparkles" className="h-4 w-4" />Найти через AI</button>
  </section>
}
