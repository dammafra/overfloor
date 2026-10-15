import { useEffect } from 'react'
import { useSafeInput } from './use-safe-input'

const USERNAME_KEY = 'overfloor-username'

// sanitized username input, persisted across sessions
export function useStoredUsername() {
  const [username, setUsername] = useSafeInput(localStorage.getItem(USERNAME_KEY) ?? '')

  useEffect(() => localStorage.setItem(USERNAME_KEY, username), [username])

  return [username, setUsername] as const
}
