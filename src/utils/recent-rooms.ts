const RECENT_ROOMS_KEY = 'overfloor-recent-rooms'
export const MAX_RECENT_ROOMS = 3

// codes of the rooms joined lately, latest first
export function getRecentRooms(): string[] {
  try {
    const rooms = JSON.parse(localStorage.getItem(RECENT_ROOMS_KEY) ?? '[]')
    if (!Array.isArray(rooms)) return []
    return rooms.filter(room => typeof room === 'string').slice(0, MAX_RECENT_ROOMS)
  } catch {
    return []
  }
}

// the latest first, moved there if already present
export function addRecentRoom(code: string) {
  const rooms = [code, ...getRecentRooms().filter(room => room !== code)]
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(rooms.slice(0, MAX_RECENT_ROOMS)))
}
