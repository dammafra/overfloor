import { Player, type PlayerProps } from '@components'
import { useFrame } from '@react-three/fiber'
import { quat, vec3, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER } from '@schema'
import { animatable } from '@utils'
import type { PlayerState } from 'playroomkit'
import { useRef, useState } from 'react'
import { Quaternion, Vector3, type Vector3Tuple } from 'three'
import { PlayerBody } from './PlayerBody'

// reused every frame
const _targetPosition = new Vector3()
const _targetRotation = new Quaternion()

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

      _targetPosition.fromArray(state?.getState(PLAYER.position) ?? position)
      _targetRotation.fromArray(state?.getState(PLAYER.rotation) ?? [0, 0, 0, 1])
      const currentPosition = vec3(bodyRef.current.translation())
      const currentRotation = quat(bodyRef.current.rotation())

      const safeDelta = Math.min(delta, 0.1)
      currentPosition.lerp(_targetPosition, 15 * safeDelta)
      currentRotation.slerp(_targetRotation, 15 * safeDelta)

      bodyRef.current.setNextKinematicTranslation(currentPosition)
      bodyRef.current.setNextKinematicRotation(currentRotation)

      setWalking(!!state?.getState(PLAYER.walking))
    })

    return (
      <PlayerBody ref={bodyRef} type="kinematicPosition">
        <Player username={username} animate={walking} {...props} />
      </PlayerBody>
    )
  },
)
