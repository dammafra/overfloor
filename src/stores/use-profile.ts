import {
  DEFAULT_COLOR,
  getStoredColor,
  getStoredEyeColor,
  getStoredPattern,
  getStoredPatternColor,
  getStoredUsername,
  sanitizeInput,
  saveProfile,
  USERNAME_MAX_LENGTH,
} from '@utils'
import { create } from 'zustand'

const sanitizeUsername = (username: string) =>
  sanitizeInput(username, { maxLength: USERNAME_MAX_LENGTH })

// side panels of the profile page, in place of its buttons: the patterns, or the wheel of a color
export type ProfilePanel = 'patterns' | 'color' | 'patternColor' | 'eyeColor'

type ProfileStore = {
  username: string
  // none until picked: the color of the model
  picked?: string
  // none: a plain body
  pattern?: number
  patternColor: string
  eyeColor: string
  // the open side panel of the profile page, the character makes room for it
  panel?: ProfilePanel
  setUsername: (username: string) => void
  pickColor: (color: string) => void
  pickPattern: (pattern?: number) => void
  pickPatternColor: (patternColor: string) => void
  pickEyeColor: (eyeColor: string) => void
  setPanel: (panel?: ProfilePanel) => void
}

// edited in the profile page and previewed by its 3D character, stored as it changes
export const useProfile = create<ProfileStore>()(set => ({
  // a longer stored one is truncated
  username: sanitizeUsername(getStoredUsername()),
  picked: getStoredColor(),
  pattern: getStoredPattern(),
  patternColor: getStoredPatternColor(),
  eyeColor: getStoredEyeColor(),
  setUsername: username => set({ username: sanitizeUsername(username) }),
  pickColor: picked => set({ picked }),
  pickPattern: pattern => set({ pattern }),
  pickPatternColor: patternColor => set({ patternColor }),
  pickEyeColor: eyeColor => set({ eyeColor }),
  setPanel: panel => set({ panel }),
}))

useProfile.subscribe(({ username, picked, pattern, patternColor, eyeColor }) =>
  saveProfile({ username, color: picked, pattern, patternColor, eyeColor }),
)

// the picked color, the one of the model otherwise
export const selectProfileColor = ({ picked }: ProfileStore) => picked ?? DEFAULT_COLOR
