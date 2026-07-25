export function RecommendationReasons({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null
  return (
    <div>
      <h3 className="font-bold text-navy">Почему подходит</h3>
      <ul className="mt-2 space-y-2 text-sm leading-5 text-muted">
        {reasons.map((reason) => <li key={reason} className="flex gap-2"><span aria-hidden="true" className="mt-0.5 text-blue">✓</span><span>{reason}</span></li>)}
      </ul>
    </div>
  )
}
