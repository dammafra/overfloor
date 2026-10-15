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

  return transitions((spring, confirm) =>
    confirm ? (
      <a.button
        className="button danger absolute bottom-8 left-8"
        style={spring}
        onClick={() => navigate('/', { replace: true })}
      >
        leave the room?
      </a.button>
    ) : (
      <a.button
        className="button danger icon large absolute bottom-8 left-8 p-1"
        style={spring}
        onClick={() => setConfirm(true)}
      >
        <span className="icon-[mdi--close]" />
      </a.button>
    ),
  )
}
