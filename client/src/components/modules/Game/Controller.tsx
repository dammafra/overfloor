import { useIsTouch } from '@hooks'
import { Html, KeyboardControls } from '@react-three/drei'
import { useController } from '@stores'
import type { PropsWithChildren } from 'react'
import ReactNipple from 'react-nipplejs'

export function Controller({ children }: PropsWithChildren) {
  const isTouch = useIsTouch()

  const setUp = useController(state => state.setUp)
  const setDown = useController(state => state.setDown)
  const setLeft = useController(state => state.setLeft)
  const setRight = useController(state => state.setRight)

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
        <Html center wrapperClass="fixed inset-0 -z-0!" className="h-screen w-screen">
          <ReactNipple
            options={{ mode: 'semi', size: 120, catchDistance: 50 }}
            style={{
              width: '100%',
              height: '100%',
            }}
            onMove={(_, data) => {
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
