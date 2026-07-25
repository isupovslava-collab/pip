import { designDnaLabels } from '../data/dictionaries'
import type { DesignDna as DesignDnaType } from '../types/reference'

export function DesignDna({ values }: { values: DesignDnaType }) {
  return (
    <section aria-labelledby="design-profile-title">
      <h2 id="design-profile-title" className="text-2xl font-bold text-navy">Профиль дизайна</h2>
      <div className="mt-5 grid gap-x-8 gap-y-4 md:grid-cols-2">
        {(Object.entries(values) as [keyof DesignDnaType, number][]).map(([key, value]) => (
          <div key={key}>
            <div className="mb-1.5 flex justify-between gap-4 text-sm"><span className="font-semibold text-ink">{designDnaLabels[key]}</span><span className="font-bold text-blue">{value} из 100</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={designDnaLabels[key]} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-blue" style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
    </section>
  )
}
