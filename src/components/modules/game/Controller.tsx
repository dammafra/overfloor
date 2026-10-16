import { useIsTouch } from '@hooks'
import { Html, KeyboardControls } from '@react-three/drei'
import { PLAYER } from '@schema'
import clsx from 'clsx'
import { myPlayer } from 'playroomkit'
import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import { Nipple } from 'react-nipplejs'

type Key = 'up' | 'down' | 'left' | 'right'

const IDLE_KEYS: Record<Key, boolean> = { up: false, down: false, left: false, right: false }

// joystick angle step: 64 directions, so small moves repeat the same state and aren't sent
const ANGLE_STEP = Math.PI / 32

/**
 * The input is the direction as a y-axis angle, 0 toward the camera (+z) and π/2 to the right (+x)
 * (see `PLAYER.joystick` and `PLAYER.angle`): analog from the joystick, 8 directions from the keys.
 * It's sent to the host, which moves the players (see `Players`).
 */
function sendInput(x: number, z: number, analog = false) {
  const pressed = x !== 0 || z !== 0

  const me = myPlayer()
  if (!me) return
  // the angle first, so the host never reads the joystick pressed with the previous one.
  // Analog changes are reliable on press only, superseded by the next ones while pressed
  const reliable = !analog || !me.getState(PLAYER.joystick)
  if (pressed) me.setState(PLAYER.angle, Math.atan2(x, z), reliable)
  me.setState(PLAYER.joystick, pressed, true)
}

/**
 * Input of the own player: an on-screen joystick on touch devices, and the keys by their physical
 * position (WASD on any layout, ZQSD on AZERTY) or the arrows.
 */
export function Controller({ children }: PropsWithChildren) {
  const isTouch = useIsTouch()
  const keysRef = useRef({ ...IDLE_KEYS })

  const [nippleHelper, setNippleHelper] = useState(true)

  useEffect(() => {
    // keyup/touchend are lost when the page loses focus, leaving the input stuck: stop
    const stop = () => {
      keysRef.current = { ...IDLE_KEYS }
      sendInput(0, 0)
    }
    const handleVisibilityChange = () => document.hidden && stop()

    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stop()
    }
  }, [])

  return (
    <KeyboardControls
      map={[
        { name: 'up', keys: ['ArrowUp', 'KeyW'] },
        { name: 'down', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      ]}
      // only the changed key: drei's state keeps keys whose keyup was lost
      onChange={(name, pressed) => {
        const keys = keysRef.current
        keys[name as Key] = pressed
        sendInput(Number(keys.right) - Number(keys.left), Number(keys.down) - Number(keys.up))
      }}
    >
      {isTouch && (
        <Html center wrapperClass="fixed inset-0 -z-0!" className="h-dvh w-screen">
          <Nipple
            options={{ mode: 'static', size: 120 }}
            className={clsx('pointer-events-none absolute! bottom-8 left-8 h-30! w-30!', {
              hidden: !nippleHelper,
            })}
          />
          <Nipple
            className="fixed inset-0 h-full! w-full!"
            options={{ mode: 'semi', size: 120, catchDistance: 0 }}
            onMove={(_, data) => {
              setNippleHelper(false)

              if (data.force < 0.2) return

              // screen angle, 0 to the right and π/2 up (away from the camera, -z)
              const angle = Math.round(data.angle.radian / ANGLE_STEP) * ANGLE_STEP
              sendInput(Math.cos(angle), -Math.sin(angle), true)
            }}
            onEnd={() => sendInput(0, 0)}
          />
        </Html>
      )}
      {children}
    </KeyboardControls>
  )
}
