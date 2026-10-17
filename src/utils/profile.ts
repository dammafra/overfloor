import type { CharacterLookSchema } from '@schema'
import { Color } from 'three'

const USERNAME_KEY = 'overfloor-username'
const COLOR_KEY = 'overfloor-color'
const PATTERN_KEY = 'overfloor-pattern'
const PATTERN_COLOR_KEY = 'overfloor-pattern-color'
const EYE_COLOR_KEY = 'overfloor-eye-color'
export const USERNAME_MAX_LENGTH = 12

// in `public/patterns`, numbered from 1: black and white tileable masks, white in the pattern color
export const PATTERNS_COUNT = 84
const DEFAULT_PATTERN_COLOR = '#ffffff'
// the ones of the model, until picked
export const DEFAULT_COLOR = '#d9e7d1'
const DEFAULT_EYE_COLOR = '#000000'
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

// none until picked in the profile: the color of the model
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

export function getStoredEyeColor() {
  const color = localStorage.getItem(EYE_COLOR_KEY)
  return isHexColor(color) ? color : DEFAULT_EYE_COLOR
}

type StoredProfile = {
  username: string
  color?: string
  pattern?: number
  patternColor: string
  eyeColor: string
}

export function saveProfile({ username, color, pattern, patternColor, eyeColor }: StoredProfile) {
  localStorage.setItem(USERNAME_KEY, username)
  setOrRemove(COLOR_KEY, color)
  setOrRemove(PATTERN_KEY, pattern?.toString())
  localStorage.setItem(PATTERN_COLOR_KEY, patternColor)
  localStorage.setItem(EYE_COLOR_KEY, eyeColor)
}

function setOrRemove(key: string, value?: string) {
  if (value) localStorage.setItem(key, value)
  else localStorage.removeItem(key)
}

// the stored look, the color of the model if none picked
export function getProfileLook(): CharacterLookSchema {
  return {
    color: getStoredColor() ?? DEFAULT_COLOR,
    pattern: getStoredPattern(),
    patternColor: getStoredPatternColor(),
    eyeColor: getStoredEyeColor(),
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

// any pattern, in a random hue much lighter or darker than the body (see `usernameColor`)
export function randomPattern() {
  const pattern = 1 + Math.floor(Math.random() * PATTERNS_COUNT)
  const lightness = Math.random() < 0.5 ? 0.15 : 0.85
  const patternColor = `#${new Color().setHSL(Math.random(), 0.7, lightness).getHexString()}`
  return { pattern, patternColor }
}

// any hue, dark enough to read as eyes on most bodies
export function randomEyeColor() {
  return `#${new Color().setHSL(Math.random(), 0.8, 0.1 + Math.random() * 0.3).getHexString()}`
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
