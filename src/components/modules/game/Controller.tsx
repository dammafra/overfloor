import { useIsTouch } from '@hooks'
import { KeyboardControls } from '@react-three/drei'
import { PLAYER } from '@schema'
import { Joystick, myPlayer } from 'playroomkit'
import { useEffect, useRef, type PropsWithChildren } from 'react'

type Key = 'up' | 'down' | 'left' | 'right'

const IDLE_KEYS: Record<Key, boolean> = { up: false, down: false, left: false, right: false }

/**
 * Same state as Playroom's joystick (see `PLAYER.joystick` and `PLAYER.angle`), from the keys:
 * the angle is around the y-axis, 0 toward the camera (+z) and π/2 to the right (+x)
 */
function sendKeys({ up, down, left, right }: Record<Key, boolean>) {
  const x = Number(right) - Number(left)
  const z = Number(down) - Number(up)
  const pressed = x !== 0 || z !== 0

  const me = myPlayer()
  if (!me) return
  if (pressed) me.setState(PLAYER.angle, Math.atan2(x, z), true)
  me.setState(PLAYER.joystick, pressed, true)
}

/**
 * Input of the own player, synced to the host which moves the players (see `Players`):
 * Playroom's on-screen joystick on touch devices, and the keys by their physical position
 * (WASD on any layout, ZQSD on AZERTY) or the arrows.
 */
export function Controller({ children }: PropsWithChildren) {
  const isTouch = useIsTouch()
  const keysRef = useRef({ ...IDLE_KEYS })

  useEffect(() => {
    if (!isTouch) return
    // its own keyboard reads the typed letters, not the key positions: replaced by `KeyboardControls`
    const joystick = new Joystick(myPlayer(), { type: 'angular', keyboard: false })
    // also removes the stick and resets its state
    return () => joystick.destroy()
  }, [isTouch])

  useEffect(() => {
    // keyup is lost when the page loses focus, leaving the input stuck: stop
    const stop = () => {
      keysRef.current = { ...IDLE_KEYS }
      sendKeys(keysRef.current)
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
        keysRef.current[name as Key] = pressed
        sendKeys(keysRef.current)
      }}
    >
      {children}
    </KeyboardControls>
  )
}
