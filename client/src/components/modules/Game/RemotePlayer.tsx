import { Player } from '@components'
import type { PropsWithRoom } from '@hooks'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import type { GameState } from '@server/schema'
import { spiralPositionGame } from '@utils'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useRef, useState } from 'react'
import { Quaternion, Vector3, type QuaternionTuple, type Vector3Tuple } from 'three'

interface RemotePlayerProps extends PropsWithRoom<GameState> {
  username: string
  index: number
}

export function RemotePlayer({ room, username, index }: RemotePlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null)
  const walkingRef = useRef<boolean>(false)
  const positionRef = useRef<Vector3Tuple>(spiralPositionGame(index)) // TODO**: improve
  const rotationRef = useRef<QuaternionTuple>([0, 0, 0, 0])

  const [walking, setWalking] = useState(false)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd(player => {
      if (player.username !== username) return

      // TODO why bindTo doesn't work?
      $(player).listen('walking', walking => (walkingRef.current = walking))
      $(player).position.onChange((position, index) => (positionRef.current[index] = position))
      $(player).rotation.onChange((rotation, index) => (rotationRef.current[index] = rotation))
    })
  }, [room, username])

  useFrame((_, delta) => {
    if (!bodyRef.current) return

    const targetPosition = new Vector3().fromArray(positionRef.current)
    const targetRotation = new Quaternion().fromArray(rotationRef.current)
    const currentPosition = vec3(bodyRef.current.translation())
    const currentRotation = quat(bodyRef.current.rotation())

    const safeDelta = Math.min(delta, 0.1)
    currentPosition.lerp(targetPosition, 15 * safeDelta)
    currentRotation.slerp(targetRotation, 15 * safeDelta)

    bodyRef.current.setNextKinematicTranslation(currentPosition)
    bodyRef.current.setNextKinematicRotation(currentRotation)

    setWalking(walkingRef.current)
  })

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      enabledRotations={[false, false, false]}
    >
      <BallCollider args={[0.6]} />
      <Player name={username} animate={walking} />
    </RigidBody>
  )
}
