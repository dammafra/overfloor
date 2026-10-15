import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

interface SafeInputOptions {
  maxLength?: number
  uppercase?: boolean
}

function sanitize(value: string, { maxLength = 20, uppercase = false }: SafeInputOptions) {
  const safe = value.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, maxLength)
  return uppercase ? safe.toUpperCase() : safe
}

export function useSafeInput(
  initialValue?: string,
  { maxLength, uppercase }: SafeInputOptions = {},
): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState(() => sanitize(initialValue || '', { maxLength, uppercase }))

  const setSafeValue = useCallback<Dispatch<SetStateAction<string>>>(
    action =>
      setValue(prev =>
        sanitize(typeof action === 'function' ? action(prev) : action, { maxLength, uppercase }),
      ),
    [maxLength, uppercase],
  )

  return [value, setSafeValue]
}
