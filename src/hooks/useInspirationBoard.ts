import { createContext, useContext } from 'react'

export interface BoardContextValue {
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  has: (id: string) => boolean
}

export const BoardContext = createContext<BoardContextValue | null>(null)

export function useInspirationBoard(): BoardContextValue {
  const context = useContext(BoardContext)
  if (!context) throw new Error('useInspirationBoard должен использоваться внутри InspirationBoardProvider')
  return context
}
