import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import { Quaternion, Vector3, type QuaternionTuple, type Vector3Tuple } from 'three'
import { Player } from './Player'

interface RemotePlayerProps {
  name: string
  initialPosition?: Vector3Tuple
  position?: Vector3Tuple
  rotation?: QuaternionTuple
}

export function RemotePlayer({ name, initialPosition, position, rotation }: RemotePlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const [walking, setWalking] = useState(false)

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1)
    if (!body.current || !position || !rotation) return

    const targetPosition = new Vector3().fromArray(position)
    const targetRotation = new Quaternion().fromArray(rotation)
    const currentPosition = vec3(body.current.translation())
    const currentRotation = quat(body.current.rotation())

    currentPosition.lerp(targetPosition, 15 * safeDelta)
    currentRotation.slerp(targetRotation, 15 * safeDelta)

    body.current.setNextKinematicTranslation(currentPosition)
    body.current.setNextKinematicRotation(currentRotation)

    const velocity = vec3(body.current.linvel())
    setWalking(velocity.length() > 1)
  })

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      enabledRotations={[false, false, false]}
      position={initialPosition}
    >
      <BallCollider args={[0.6]} />
      <Player name={name} animate={walking} />
    </RigidBody>
  )
}
