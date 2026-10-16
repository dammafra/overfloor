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
