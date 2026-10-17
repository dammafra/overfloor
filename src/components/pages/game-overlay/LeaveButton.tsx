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

  // sized as the icon button, the confirmation overflows to the right
  return (
    <div className="relative z-10 size-12">
      {transitions((spring, confirm) =>
        confirm ? (
          <a.button
            className="button danger absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap"
            style={spring}
            onClick={() => navigate('/', { replace: true })}
          >
            leave the room?
          </a.button>
        ) : (
          <a.button
            className="button danger icon large absolute top-0 left-0 p-1"
            style={spring}
            onClick={() => setConfirm(true)}
          >
            <span className="icon-[mdi--logout]" />
          </a.button>
        ),
      )}
    </div>
  )
}
