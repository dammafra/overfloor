import { useIsTouch } from '@hooks'
import { Html, KeyboardControls } from '@react-three/drei'
import { useController } from '@stores'
import Joystick, { DirectionCount } from 'rc-joystick'
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
        <Html center wrapperClass="fixed inset-0 pointer-events-none">
          <div className="h-[100dvh] w-screen">
            <Joystick
              throttle={200}
              className="absolute! bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto bg-stone-900!"
              controllerClassName="bg-radial! from-red-500 to-red-800 shadow!"
              directionCount={DirectionCount.Nine}
              onDirectionChange={direction => {
                setUp(direction.toLowerCase().includes('top'))
                setDown(direction.toLowerCase().includes('bottom'))
                setLeft(direction.toLowerCase().includes('left'))
                setRight(direction.toLowerCase().includes('right'))
              }}
            />
          </div>
        </Html>
      )}

      {children}
    </KeyboardControls>
  )
}
