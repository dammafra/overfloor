import { Player } from '@components'
import { useThrottle, type PropsWithRoom } from '@hooks'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import type { GameState } from '@server/schema'
import { useController } from '@stores'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useRef, useState } from 'react'
import { MathUtils, Quaternion, Vector3, type Vector3Tuple } from 'three'
import { Controller } from './Controller'

// TODO**: improve, don't export
export function spiralPosition(index: number): Vector3Tuple {
  const r = 1.5
  const angle = MathUtils.degToRad(index * 60) // spacing
  const x = r * Math.cos(angle)
  const z = r * Math.sin(angle)
  const y = 4 // constant height
  return [x, y, z]
}

export function LocalPlayer({ room }: PropsWithRoom<GameState>) {
  const { up, down, left, right } = useController()

  const bodyRef = useRef<RapierRigidBody>(null)

  const [walking, setWalking] = useState(false)
  const [username, setUsername] = useState<string>()
  const [initialPosition, setInitialPosition] = useState<Vector3Tuple>([0, 0, 0])

  const sendWalking = useThrottle((walking: boolean) => room?.send('set-walking', walking))
  const sendMovement = useThrottle(() => {
    if (bodyRef.current?.isSleeping()) return
    room?.send('set-position', vec3(bodyRef.current?.translation()).toArray())
    room?.send('set-rotation', quat(bodyRef.current?.rotation()).toArray())
  })

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd((player, sessionId) => {
      if (room.sessionId !== sessionId) return

      setUsername(player.username)
      setInitialPosition(spiralPosition(player.index))
    })
  }, [room])

  useEffect(() => sendWalking(walking), [walking])

  useFrame((_, delta) => {
    if (!bodyRef.current) return
    sendMovement()

    setWalking(up || down || left || right)

    const impulse = new Vector3()
    if (up) impulse.z -= 1
    if (down) impulse.z += 1
    if (right) impulse.x += 1
    if (left) impulse.x -= 1

    const safeDelta = Math.min(delta, 0.1)
    const impulseStrength = 30 * safeDelta
    impulse.normalize().multiplyScalar(impulseStrength)

    if (impulse.equals(new Vector3())) return

    bodyRef.current.applyImpulse(impulse, true)

    // rotation toward direction
    const target = impulse.clone().normalize()
    const angle = Math.atan2(target.x, target.z) // y-axis rotation
    const current = quat(bodyRef.current.rotation())
    const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle)

    // smooth interpolation
    const lerped = new Quaternion().slerpQuaternions(current, q, 5 * delta)
    bodyRef.current.setRotation(lerped, true)
  })

  return (
    username && (
      <Controller>
        <RigidBody
          ref={bodyRef}
          colliders={false}
          enabledRotations={[false, false, false]}
          position={initialPosition}
        >
          <BallCollider args={[0.6]} />
          <Player name={username} animate={walking} />
        </RigidBody>
      </Controller>
    )
  )
}
