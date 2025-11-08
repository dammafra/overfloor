import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

export function useSafeInput(initialValue?: string): [string, Dispatch<SetStateAction<string>>] {
  const [value, setValue] = useState(initialValue || '')

  useEffect(() => {
    {
      const safeValue = value.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 20)
      setValue(safeValue)
    }
  }, [value])

  return [value, setValue]
}
