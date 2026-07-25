import { Icon } from './Icon'

export function RecommendationReasons({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-navy"><span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-50 text-blue"><Icon name="insight" className="h-4 w-4" /></span>Почему подходит</h3>
      <ul className="mt-3 space-y-2.5 text-sm leading-5 text-muted">
        {reasons.map((reason) => <li key={reason} className="flex gap-2.5"><span aria-hidden="true" className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sky-100 text-blue"><Icon name="check" className="h-3 w-3" /></span><span>{reason}</span></li>)}
      </ul>
    </div>
  )
}
