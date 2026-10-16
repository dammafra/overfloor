import { Color } from 'three'

const USERNAME_KEY = 'overfloor-username'
const COLOR_KEY = 'overfloor-color'
export const USERNAME_MAX_LENGTH = 12

// the color input works with hex colors only
const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY) ?? ''
}

// none until picked in the profile: the color follows the username
export function getStoredColor() {
  const color = localStorage.getItem(COLOR_KEY)
  return color && HEX_COLOR.test(color) ? color : undefined
}

export function saveProfile({ username, color }: { username: string; color?: string }) {
  localStorage.setItem(USERNAME_KEY, username)
  if (color) localStorage.setItem(COLOR_KEY, color)
  else localStorage.removeItem(COLOR_KEY)
}

// the picked one, the default one of the username otherwise
export function getProfileColor(username: string) {
  return getStoredColor() ?? usernameColor(username)
}

// default color of a player, from its username
export function usernameColor(str: string) {
  // simple 32-bit hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // ensure 32-bit
  }

  // avalanche (murmur3 finalizer): similar strings, e.g. "Bot 1" and "Bot 2", get distant hues
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  hash >>>= 0

  const h = (hash / 2 ** 32) * 360
  const s = 65 + (hash % 20) // 65–84%
  const l = 45 + ((hash >>> 8) % 15) // 45–59%

  return `#${new Color(`hsl(${Math.round(h)}, ${s}%, ${l}%)`).getHexString()}`
}
