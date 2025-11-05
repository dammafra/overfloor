import { useIsTouch } from '@hooks'
import { Html, KeyboardControls } from '@react-three/drei'
import { useController } from '@stores'
import Joystick, { DirectionCount, GhostArea } from 'rc-joystick'
import type { PropsWithChildren } from 'react'

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
        <Html center wrapperClass="fixed inset-0 ml-40">
          <GhostArea className="h-[100dvh] w-screen">
            <Joystick
              throttle={200}
              className="opacity-50"
              directionCount={DirectionCount.Nine}
              onDirectionChange={direction => {
                setUp(direction.toLowerCase().includes('top'))
                setDown(direction.toLowerCase().includes('bottom'))
                setLeft(direction.toLowerCase().includes('left'))
                setRight(direction.toLowerCase().includes('right'))
              }}
            />
          </GhostArea>
        </Html>
      )}

      {children}
    </KeyboardControls>
  )
}
