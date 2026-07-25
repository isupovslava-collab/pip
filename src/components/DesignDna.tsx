import { designDnaLabels } from '../data/dictionaries'
import type { DesignDna as DesignDnaType } from '../types/reference'
import { Icon } from './Icon'

export function DesignDna({ values }: { values: DesignDnaType }) {
  return (
    <section aria-labelledby="design-profile-title" className="rounded-2xl bg-slate-50 p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-bright"><Icon name="insight" className="h-5 w-5" /></span>
        <div><h2 id="design-profile-title" className="text-2xl font-semibold tracking-tight text-navy">Профиль дизайна</h2><p className="mt-1 text-sm text-muted">Выраженность характеристик по единой шкале от 0 до 100</p></div>
      </div>
      <div className="mt-7 grid gap-x-10 gap-y-5 md:grid-cols-2">
        {(Object.entries(values) as [keyof DesignDnaType, number][]).map(([key, value]) => (
          <div key={key}>
            <div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-medium text-ink">{designDnaLabels[key]}</span><span className="rounded-md bg-white px-2 py-0.5 font-semibold tabular-nums text-blue shadow-sm">{value} / 100</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner" role="progressbar" aria-label={designDnaLabels[key]} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-blue transition-[width] duration-200" style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  )
}
