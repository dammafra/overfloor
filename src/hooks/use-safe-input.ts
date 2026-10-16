import { sanitizeInput, type SafeInputOptions } from '@utils'
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

export function useSafeInput(
  initialValue?: string,
  { maxLength, uppercase }: SafeInputOptions = {},
): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState(() =>
    sanitizeInput(initialValue || '', { maxLength, uppercase }),
  )

  const setSafeValue = useCallback<Dispatch<SetStateAction<string>>>(
    action =>
      setValue(prev =>
        sanitizeInput(typeof action === 'function' ? action(prev) : action, {
          maxLength,
          uppercase,
        }),
      ),
    [maxLength, uppercase],
  )

  return [value, setSafeValue]
}
