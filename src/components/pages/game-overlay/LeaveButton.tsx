import { a, useTransition } from '@react-spring/web'
import { POP_TRANSITION } from '@utils'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

export function LeaveButton() {
  const [, navigate] = useLocation()
  const [confirm, setConfirm] = useState(false)

  // confirmation expires after a while
  useEffect(() => {
    if (!confirm) return
    const timeout = setTimeout(() => setConfirm(false), 3000)
    return () => clearTimeout(timeout)
  }, [confirm])

  const transitions = useTransition(confirm, POP_TRANSITION)

  // sized as the icon button, the confirmation overflows to the left
  return (
    <div className="relative ml-auto size-12">
      {transitions((spring, confirm) =>
        confirm ? (
          <a.button
            className="button danger absolute top-1/2 right-0 -translate-y-1/2 whitespace-nowrap"
            style={spring}
            onClick={() => navigate('/', { replace: true })}
          >
            leave the room?
          </a.button>
        ) : (
          <a.button
            className="button danger icon large absolute top-0 right-0 p-1"
            style={spring}
            onClick={() => setConfirm(true)}
          >
            <span className="icon-[mdi--close]" />
          </a.button>
        ),
      )}
    </div>
  )
}
