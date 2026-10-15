import { useEffect } from 'react'
import { useSafeInput } from './use-safe-input'

const USERNAME_KEY = 'overfloor-username'
const USERNAME_MAX_LENGTH = 12

// sanitized username input, persisted across sessions (a longer stored one is truncated)
export function useStoredUsername() {
  const [username, setUsername] = useSafeInput(localStorage.getItem(USERNAME_KEY) ?? '', {
    maxLength: USERNAME_MAX_LENGTH,
  })

  useEffect(() => localStorage.setItem(USERNAME_KEY, username), [username])

  return [username, setUsername] as const
}
