import { Player, type PlayerProps } from '@components'
import { animatable } from '@utils'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER } from '@schema'
import type { PlayerState } from 'playroomkit'
import { useRef, useState } from 'react'
import { Quaternion, Vector3, type Vector3Tuple } from 'three'
import { PLAYERS_COLLISION_GROUP } from './LocalPlayer'

type RemotePlayerProps = PlayerProps & {
  username: string
  position: Vector3Tuple
  state?: PlayerState
}

export const RemotePlayer = animatable(
  ({ username, position, state, ...props }: RemotePlayerProps) => {
    const bodyRef = useRef<RapierRigidBody>(null)
    const [walking, setWalking] = useState(false)

    useFrame((_, delta) => {
      if (!bodyRef.current) return

      const targetPosition = new Vector3().fromArray(state?.getState(PLAYER.position) ?? position)
      const targetRotation = new Quaternion().fromArray(
        state?.getState(PLAYER.rotation) ?? [0, 0, 0, 1],
      )
      const currentPosition = vec3(bodyRef.current.translation())
      const currentRotation = quat(bodyRef.current.rotation())

      const safeDelta = Math.min(delta, 0.1)
      currentPosition.lerp(targetPosition, 15 * safeDelta)
      currentRotation.slerp(targetRotation, 15 * safeDelta)

      bodyRef.current.setNextKinematicTranslation(currentPosition)
      bodyRef.current.setNextKinematicRotation(currentRotation)

      setWalking(!!state?.getState(PLAYER.walking))
    })

    return (
      <RigidBody
        ref={bodyRef}
        type="kinematicPosition"
        colliders={false}
        enabledRotations={[false, false, false]}
        collisionGroups={PLAYERS_COLLISION_GROUP}
      >
        <BallCollider args={[0.6]} />
        <Player username={username} animate={walking} {...props} />
      </RigidBody>
    )
  },
)
