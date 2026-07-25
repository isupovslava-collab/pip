import { NavLink } from 'react-router-dom'
import { useInspirationBoard } from '../hooks/useInspirationBoard'

export function AppHeader() {
  const { ids } = useInspirationBoard()
  const navClass = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-blue text-white' : 'text-navy hover:bg-slate-100'}`

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3" aria-label="PIP — на главную">
          <span className="rounded-lg bg-navy px-3 py-2 text-xl font-black tracking-tight text-white">PIP</span>
          <span className="hidden text-sm leading-tight text-muted sm:block">Presentation<br />Intelligence Platform</span>
        </NavLink>
        <nav className="flex items-center gap-1" aria-label="Основная навигация">
          <NavLink to="/" end className={navClass}>Подобрать дизайн</NavLink>
          <NavLink to="/board" className={navClass}>
            Моя доска <span className="ml-1 rounded-full bg-amber px-2 py-0.5 text-xs font-bold text-navy" aria-label={`Сохранено: ${ids.length}`}>{ids.length}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
