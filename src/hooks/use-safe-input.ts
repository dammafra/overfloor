import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 20)

export function useSafeInput(initialValue?: string): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState(() => sanitize(initialValue || ''))

  const setSafeValue = useCallback<Dispatch<SetStateAction<string>>>(
    action => setValue(prev => sanitize(typeof action === 'function' ? action(prev) : action)),
    [],
  )

  return [value, setSafeValue]
}
