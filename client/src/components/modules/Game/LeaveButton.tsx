import { a, useTransition } from '@react-spring/web'
import { Html } from '@react-three/drei'
import { useState } from 'react'
import { useLocation } from 'wouter'

export function LeaveButton() {
  const [, navigate] = useLocation()
  const [confirm, setConfirm] = useState(false)

  const transitions = useTransition(confirm, {
    from: { scale: 0, opacity: 0 },
    enter: { scale: 1, opacity: 1 },
    leave: { scale: 0, opacity: 0 },
    config: { tension: 300, friction: 20 },
  })

  return (
    <Html center className="absolute inset-0" wrapperClass="fixed inset-0">
      {transitions((spring, confirm) =>
        confirm ? (
          <a.button
            className="button danger absolute left-8 bottom-8"
            style={spring}
            onClick={() => navigate('/', { replace: true })}
          >
            leave the room?
          </a.button>
        ) : (
          <a.button
            className="button danger absolute left-8 bottom-8 icon large"
            style={spring}
            onClick={() => {
              setConfirm(true)
              setTimeout(() => setConfirm(false), 3000)
            }}
          >
            <span className="icon-[mdi--chevron-left]" />
          </a.button>
        ),
      )}
    </Html>
  )
}
