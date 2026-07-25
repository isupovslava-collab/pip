import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BoardContext, type BoardContextValue } from '../hooks/useInspirationBoard'
import { addBoardId, readBoardIds, removeBoardId, writeBoardIds } from '../utils/storage'

export function InspirationBoardProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => readBoardIds())

  useEffect(() => {
    writeBoardIds(ids)
  }, [ids])

  const value = useMemo<BoardContextValue>(() => ({
    ids,
    add: (id) => setIds((current) => addBoardId(current, id)),
    remove: (id) => setIds((current) => removeBoardId(current, id)),
    has: (id) => ids.includes(id),
  }), [ids])

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
}
