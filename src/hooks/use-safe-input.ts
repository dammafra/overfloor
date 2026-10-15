import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

const sanitize = (value: string, maxLength: number) =>
  value.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, maxLength)

export function useSafeInput(
  initialValue?: string,
  maxLength = 20,
): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState(() => sanitize(initialValue || '', maxLength))

  const setSafeValue = useCallback<Dispatch<SetStateAction<string>>>(
    action =>
      setValue(prev => sanitize(typeof action === 'function' ? action(prev) : action, maxLength)),
    [maxLength],
  )

  return [value, setSafeValue]
}
