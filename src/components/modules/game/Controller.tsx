import { useIsTouch } from '@hooks'
import { Html, KeyboardControls } from '@react-three/drei'
import { IDLE_DIRECTION, useController } from '@stores'
import clsx from 'clsx'
import { useState, type PropsWithChildren } from 'react'
import ReactNipple from 'react-nipplejs'

const OCTANT = Math.PI / 4

export function Controller({ children }: PropsWithChildren) {
  const isTouch = useIsTouch()
  const setDirection = useController(state => state.setDirection)

  const [nippleHelper, setNippleHelper] = useState(true)

  return (
    <KeyboardControls
      map={[
        { name: 'up', keys: ['ArrowUp', 'KeyW'] },
        { name: 'down', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      ]}
      onChange={(_name, _pressed, { up, down, left, right }) =>
        setDirection({ up, down, left, right })
      }
    >
      {isTouch && (
        <Html center wrapperClass="fixed inset-0 -z-0!" className="h-[100dvh] w-screen">
          <ReactNipple
            options={{ mode: 'static', size: 120 }}
            className={clsx('pointer-events-none absolute! right-8 bottom-8 h-30! w-30!', {
              hidden: !nippleHelper,
            })}
          />
          <ReactNipple
            className="fixed inset-0 h-full! w-full!"
            options={{ mode: 'semi', size: 120, catchDistance: 0 }}
            onMove={(_, data) => {
              setNippleHelper(false)

              if (data.force < 0.2) return

              // snap the angle to one of the 8 directions
              const angle = Math.round(data.angle.radian / OCTANT) * OCTANT
              const x = Math.cos(angle)
              const y = Math.sin(angle)

              setDirection({ up: y > 0.5, down: y < -0.5, left: x < -0.5, right: x > 0.5 })
            }}
            onEnd={() => setDirection(IDLE_DIRECTION)}
          />
        </Html>
      )}

      {children}
    </KeyboardControls>
  )
}
