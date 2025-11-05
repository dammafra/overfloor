import { useIsTouch } from '@hooks'
import { Html, KeyboardControls } from '@react-three/drei'
import { useController } from '@stores'
import { useState, type PropsWithChildren } from 'react'
import ReactNipple from 'react-nipplejs'

export function Controller({ children }: PropsWithChildren) {
  const isTouch = useIsTouch()

  const setUp = useController(state => state.setUp)
  const setDown = useController(state => state.setDown)
  const setLeft = useController(state => state.setLeft)
  const setRight = useController(state => state.setRight)

  const [nippleHelper, setNippleHelper] = useState(true)

  return (
    <KeyboardControls
      map={[
        { name: 'up', keys: ['ArrowUp', 'KeyW'] },
        { name: 'down', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      ]}
      onChange={(_name, _pressed, state) => {
        setUp(state.up)
        setDown(state.down)
        setLeft(state.left)
        setRight(state.right)
      }}
    >
      {isTouch && (
        <Html center wrapperClass="fixed inset-0 -z-0!" className="h-[100dvh] w-screen">
          {nippleHelper && (
            <ReactNipple
              options={{ mode: 'static', size: 120 }}
              className="w-30! h-30! absolute! bottom-8 right-8 pointer-events-none"
            />
          )}
          <ReactNipple
            className="fixed inset-0 w-full! h-full!"
            options={{ mode: 'semi', size: 120, catchDistance: 50 }}
            onMove={(_, data) => {
              setNippleHelper(false)

              if (data.force < 0.2) return

              const directions = [
                'right',
                'top right',
                'top',
                'top left',
                'left',
                'bottom left',
                'bottom',
                'bottom right',
              ]

              const angle = (data.angle.radian + Math.PI * 2) % (Math.PI * 2)
              const index = Math.round(angle / (Math.PI / 4)) % 8
              const direction = directions[index]

              setUp(direction.toLowerCase().includes('top'))
              setDown(direction.toLowerCase().includes('bottom'))
              setLeft(direction.toLowerCase().includes('left'))
              setRight(direction.toLowerCase().includes('right'))
            }}
            onEnd={() => {
              setUp(false)
              setDown(false)
              setLeft(false)
              setRight(false)
            }}
          />
        </Html>
      )}

      {children}
    </KeyboardControls>
  )
}
