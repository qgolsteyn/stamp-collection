export const CONDITIONS = ['mint', 'used', 'damaged'] as const
export type Condition = (typeof CONDITIONS)[number]

export type Stamp = {
  id: string
  country: string
  year?: number
  denomination?: string
  condition: Condition
  notes?: string
  createdAt: string
}

export type StampInput = Omit<Stamp, 'id' | 'createdAt'>

const KEY = 'stamps'

function isStamp(value: unknown): value is Stamp {
  const s = value as Stamp
  return (
    typeof s === 'object' &&
    s !== null &&
    typeof s.id === 'string' &&
    typeof s.country === 'string' &&
    typeof s.createdAt === 'string' &&
    CONDITIONS.includes(s.condition)
  )
}

/** Reads saved stamps. Missing or corrupt data yields an empty list; malformed entries are dropped. */
export function loadStamps(): Stamp[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(data) ? data.filter(isStamp) : []
  } catch {
    return []
  }
}

export function saveStamps(stamps: Stamp[]): void {
  localStorage.setItem(KEY, JSON.stringify(stamps))
}

export function createStamp(input: StampInput): Stamp {
  return { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
}

export function sortNewestFirst(stamps: Stamp[]): Stamp[] {
  return [...stamps].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
