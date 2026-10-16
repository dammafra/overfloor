export const TOUCH_QUERY = '(pointer: coarse)'

// a touch screen as the main input, e.g. a phone
export const isTouchDevice = () => window.matchMedia(TOUCH_QUERY).matches

export interface SafeInputOptions {
  maxLength?: number
  uppercase?: boolean
}

// letters, digits, dashes and underscores only, e.g. for usernames and room codes
export function sanitizeInput(
  value: string,
  { maxLength = 20, uppercase = false }: SafeInputOptions = {},
) {
  const safe = value.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, maxLength)
  return uppercase ? safe.toUpperCase() : safe
}
