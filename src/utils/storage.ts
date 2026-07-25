export const BOARD_STORAGE_KEY = 'pip-inspiration-board-v1'

export function readBoardIds(storage: Storage = localStorage): string[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(BOARD_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) throw new Error('Некорректные данные')
    return [...new Set(value)]
  } catch {
    storage.removeItem(BOARD_STORAGE_KEY)
    return []
  }
}

export function writeBoardIds(ids: string[], storage: Storage = localStorage): string[] {
  const uniqueIds = [...new Set(ids)]
  storage.setItem(BOARD_STORAGE_KEY, JSON.stringify(uniqueIds))
  return uniqueIds
}

export function addBoardId(ids: string[], id: string): string[] {
  return [...new Set([...ids, id])]
}

export function removeBoardId(ids: string[], id: string): string[] {
  return ids.filter((savedId) => savedId !== id)
}
