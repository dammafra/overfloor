import { getStoredUsername, USERNAME_MAX_LENGTH } from '@utils'
import { useSafeInput } from './use-safe-input'

// sanitized username input, initialized with the stored one (a longer one is truncated)
export function useUsernameInput() {
  return useSafeInput(getStoredUsername(), { maxLength: USERNAME_MAX_LENGTH })
}
