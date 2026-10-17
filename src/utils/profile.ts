import type { CharacterLookSchema } from '@schema'
import { Color } from 'three'

const USERNAME_KEY = 'overfloor-username'
const COLOR_KEY = 'overfloor-color'
const PATTERN_KEY = 'overfloor-pattern'
const PATTERN_COLOR_KEY = 'overfloor-pattern-color'
export const USERNAME_MAX_LENGTH = 12

// in `public/patterns`, numbered from 1: black and white tileable masks, white in the pattern color
export const PATTERNS_COUNT = 84
const DEFAULT_PATTERN_COLOR = '#ffffff'
// repetitions of the pattern across each face of the character's body, and across each preview of
// the profile page: a multiple of 0.25, for a whole number all around the body so it closes
// without a seam
export const PATTERN_REPEAT = 1

// the color input works with hex colors only
const HEX_COLOR = /^#[0-9a-f]{6}$/i

export function patternUrl(pattern: number) {
  return `/patterns/pattern_${String(pattern).padStart(2, '0')}.png`
}

export function isPattern(pattern: unknown): pattern is number {
  return Number.isInteger(pattern) && Number(pattern) >= 1 && Number(pattern) <= PATTERNS_COUNT
}

export function isHexColor(color: unknown): color is string {
  return typeof color === 'string' && HEX_COLOR.test(color)
}

export function getStoredUsername() {
  return localStorage.getItem(USERNAME_KEY) ?? ''
}

// none until picked in the profile: the color follows the username
export function getStoredColor() {
  const color = localStorage.getItem(COLOR_KEY)
  return isHexColor(color) ? color : undefined
}

// none until picked in the profile: a plain body
export function getStoredPattern() {
  const pattern = Number(localStorage.getItem(PATTERN_KEY))
  return isPattern(pattern) ? pattern : undefined
}

export function getStoredPatternColor() {
  const color = localStorage.getItem(PATTERN_COLOR_KEY)
  return isHexColor(color) ? color : DEFAULT_PATTERN_COLOR
}

type StoredProfile = {
  username: string
  color?: string
  pattern?: number
  patternColor: string
}

export function saveProfile({ username, color, pattern, patternColor }: StoredProfile) {
  localStorage.setItem(USERNAME_KEY, username)
  setOrRemove(COLOR_KEY, color)
  setOrRemove(PATTERN_KEY, pattern?.toString())
  localStorage.setItem(PATTERN_COLOR_KEY, patternColor)
}

function setOrRemove(key: string, value?: string) {
  if (value) localStorage.setItem(key, value)
  else localStorage.removeItem(key)
}

// the stored look, the default color of the username if none picked
export function getProfileLook(username: string): CharacterLookSchema {
  return {
    color: getStoredColor() ?? usernameColor(username),
    pattern: getStoredPattern(),
    patternColor: getStoredPatternColor(),
  }
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

// white on the given background, black only when white barely reads on it
export function contrastColor(background: string) {
  // linear rgb, as the relative luminance wants it
  const { r, g, b } = new Color(background)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  // WCAG contrast ratio of white, from 1 (white on white) to 21 (white on black)
  const contrast = 1.05 / (luminance + 0.05)
  return contrast < 1.75 ? 'black' : 'white'
}
