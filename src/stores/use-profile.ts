import {
  getStoredColor,
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
  setUsername: (username: string) => void
  pickColor: (color: string) => void
}

// edited in the profile page and previewed by its 3D character, stored as it changes
export const useProfile = create<ProfileStore>()(set => ({
  // a longer stored one is truncated
  username: sanitizeUsername(getStoredUsername()),
  picked: getStoredColor(),
  setUsername: username => set({ username: sanitizeUsername(username) }),
  pickColor: picked => set({ picked }),
}))

useProfile.subscribe(({ username, picked }) => saveProfile({ username, color: picked }))

// the picked color, the default one of the username otherwise
export const selectProfileColor = ({ username, picked }: ProfileStore) =>
  picked ?? usernameColor(username)
