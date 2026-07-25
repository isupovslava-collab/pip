import { useInspirationBoard } from '../hooks/useInspirationBoard'

export function BoardButton({ id, className = '' }: { id: string; className?: string }) {
  const board = useInspirationBoard()
  const saved = board.has(id)
  return (
    <button type="button" onClick={() => saved ? board.remove(id) : board.add(id)} aria-pressed={saved} className={`min-h-11 rounded-lg border px-4 font-bold transition-colors ${saved ? 'border-blue bg-sky-50 text-blue' : 'border-line bg-white text-navy hover:border-blue'} ${className}`}>
      {saved ? 'Убрать с доски' : 'Добавить на доску'}
    </button>
  )
}
