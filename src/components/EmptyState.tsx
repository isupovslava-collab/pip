import { Link } from 'react-router-dom'

export function EmptyState({ title, text, action = true }: { title: string; text: string; action?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-2xl text-blue" aria-hidden="true">◇</div>
      <h1 className="mt-5 text-2xl font-bold text-navy">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-muted">{text}</p>
      {action && <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue px-5 font-bold text-white">Подобрать дизайн</Link>}
    </div>
  )
}
