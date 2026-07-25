import { Link } from 'react-router-dom'
import { Icon } from './Icon'

export function EmptyState({ title, text, action = true }: { title: string; text: string; action?: boolean }) {
  return (
    <div className="surface relative overflow-hidden px-6 py-16 text-center sm:py-20">
      <div className="absolute left-1/2 top-0 h-36 w-72 -translate-x-1/2 rounded-full bg-sky-50 blur-2xl" aria-hidden="true" />
      <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy text-bright shadow-card" aria-hidden="true"><Icon name="sparkles" className="h-8 w-8" /></div>
      <h1 className="relative mt-6 text-2xl font-semibold tracking-tight text-navy">{title}</h1>
      <p className="relative mx-auto mt-3 max-w-xl text-base leading-7 text-muted">{text}</p>
      {action && <Link to="/" className="btn-primary relative mt-7"><Icon name="insight" className="h-4 w-4" />Подобрать дизайн</Link>}
    </div>
  )
}
