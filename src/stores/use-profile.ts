import {
  getStoredColor,
  getStoredPattern,
  getStoredPatternColor,
  getStoredUsername,
  sanitizeInput,
  saveProfile,
  USERNAME_MAX_LENGTH,
  usernameColor,
} from '@utils'
import { create } from 'zustand'

const sanitizeUsername = (username: string) =>
  sanitizeInput(username, { maxLength: USERNAME_MAX_LENGTH })

type ProfileStore = {
  username: string
  // none until picked: the color follows the username
  picked?: string
  // none: a plain body
  pattern?: number
  patternColor: string
  setUsername: (username: string) => void
  pickColor: (color: string) => void
  pickPattern: (pattern?: number) => void
  pickPatternColor: (patternColor: string) => void
}

// edited in the profile page and previewed by its 3D character, stored as it changes
export const useProfile = create<ProfileStore>()(set => ({
  // a longer stored one is truncated
  username: sanitizeUsername(getStoredUsername()),
  picked: getStoredColor(),
  pattern: getStoredPattern(),
  patternColor: getStoredPatternColor(),
  setUsername: username => set({ username: sanitizeUsername(username) }),
  pickColor: picked => set({ picked }),
  pickPattern: pattern => set({ pattern }),
  pickPatternColor: patternColor => set({ patternColor }),
}))

useProfile.subscribe(({ username, picked, pattern, patternColor }) =>
  saveProfile({ username, color: picked, pattern, patternColor }),
)

// the picked color, the default one of the username otherwise
export const selectProfileColor = ({ username, picked }: ProfileStore) =>
  picked ?? usernameColor(username)
