import { Player } from '@components'
import { useThrottle, type PropsWithRoom } from '@hooks'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import type { GameState } from '@server/schema'
import { useController } from '@stores'
import { spiralPositionGame } from '@utils'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useRef, useState } from 'react'
import { Quaternion, Vector3, type Vector3Tuple } from 'three'
import { v4 as uuid } from 'uuid'
import { Controller } from './Controller'

const GROUP = 0x0001 // category bit 1
const MASK = 0xffff ^ GROUP // collide with everything except itself
export const PLAYERS_COLLISION_GROUP = (GROUP << 16) | MASK

export function LocalPlayer({ room }: PropsWithRoom<GameState>) {
  const { up, down, left, right, strength } = useController()

  const bodyRef = useRef<RapierRigidBody>(null)

  const [walking, setWalking] = useState(false)
  const [username, setUsername] = useState<string>()
  const [bodyKey, setBodyKey] = useState<string>()
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
      setBodyKey(uuid())
      setInitialPosition(spiralPositionGame(player.index))
    })
  }, [room])

  useEffect(() => sendWalking(walking), [walking, sendWalking])

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
    const impulseStrength = strength * safeDelta
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
          key={bodyKey}
          ref={bodyRef}
          colliders={false}
          gravityScale={5}
          friction={0.5}
          linearDamping={0.5}
          enabledRotations={[false, false, false]}
          position={initialPosition}
          collisionGroups={PLAYERS_COLLISION_GROUP}
        >
          <BallCollider args={[0.6]} />
          <Player username={username} animate={walking} showIndicator />
        </RigidBody>
      </Controller>
    )
  )
}
