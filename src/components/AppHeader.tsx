import { NavLink } from 'react-router-dom'
import { useInspirationBoard } from '../hooks/useInspirationBoard'
import { Icon } from './Icon'

export function AppHeader() {
  const { ids } = useInspirationBoard()
  const secondaryNavClass = ({ isActive }: { isActive: boolean }) => `inline-flex min-h-11 items-center rounded-xl border px-3 py-2 text-sm font-semibold transition duration-200 sm:px-4 ${isActive ? 'border-sky-200 bg-sky-50 text-navy shadow-sm' : 'border-transparent text-muted hover:border-line hover:bg-white hover:text-navy'}`

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3" aria-label="PIP — на главную">
          <span className="relative grid h-10 w-12 place-items-center overflow-hidden rounded-xl bg-navy text-lg font-extrabold tracking-tight text-white shadow-sm"><span className="absolute bottom-0 left-0 h-1 w-full bg-bright" />PIP</span>
          <span className="hidden text-[13px] font-medium leading-[1.15] tracking-wide text-muted sm:block">Presentation<br /><span className="text-navy">Intelligence Platform</span></span>
        </NavLink>
        <nav className="flex items-center gap-1.5" aria-label="Основная навигация">
          <NavLink to="/" end className={({ isActive }) => `inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold transition duration-200 sm:px-4 ${isActive ? 'bg-navy text-white shadow-sm' : 'text-navy hover:bg-slate-100'}`}>Подобрать дизайн</NavLink>
          <NavLink to="/board" className={secondaryNavClass}>
            <Icon name="bookmark" className="hidden h-4 w-4 sm:block" />
            <span className="hidden sm:inline">Моя доска</span><span className="sm:hidden">Доска</span>
            <span className="ml-1 grid min-h-6 min-w-6 place-items-center rounded-full bg-amber px-1.5 text-xs font-bold text-navy" aria-label={`Сохранено: ${ids.length}`}>{ids.length}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
