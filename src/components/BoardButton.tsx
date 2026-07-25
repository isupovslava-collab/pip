import { useInspirationBoard } from '../hooks/useInspirationBoard'
import { Icon } from './Icon'

export function BoardButton({ id, className = '' }: { id: string; className?: string }) {
  const board = useInspirationBoard()
  const saved = board.has(id)
  return (
    <button type="button" onClick={() => saved ? board.remove(id) : board.add(id)} aria-pressed={saved} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-center text-xs font-semibold leading-tight transition duration-200 sm:text-sm ${saved ? 'border-success/30 bg-emerald-50 text-success shadow-sm' : 'border-line bg-white text-navy hover:border-bright hover:bg-sky-50'} ${className}`}>
      <Icon name={saved ? 'check' : 'bookmark'} className="h-4 w-4 shrink-0" />
      <span>{saved ? 'Убрать с доски' : 'Добавить на доску'}</span>
    </button>
  )
}
