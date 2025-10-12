import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import { useController } from '@stores'
import { useRef, useState } from 'react'
import { Quaternion, Vector3, type Vector3Tuple } from 'three'
import { Player } from './Player'

interface LocalPlayerProps {
  name?: string
  initialPosition?: Vector3Tuple
  onMove?: (position: Vector3, rotation: Quaternion) => void
}

export function LocalPlayer({ name, initialPosition, onMove }: LocalPlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const { up, down, left, right } = useController()
  const [walking, setWalking] = useState(false)

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1)

    if (!body.current) return

    if (!body.current.isSleeping()) {
      const position = vec3(body.current?.translation())
      const rotation = quat(body.current?.rotation())
      onMove?.(position, rotation)
    }

    setWalking(up || down || left || right)

    const impulse = new Vector3()

    if (up) impulse.z -= 1
    if (down) impulse.z += 1
    if (right) impulse.x += 1
    if (left) impulse.x -= 1

    const impulseStrength = 30 * safeDelta
    impulse.normalize().multiplyScalar(impulseStrength)

    if (impulse.equals(new Vector3())) return

    body.current.applyImpulse(impulse, true)

    // rotation toward direction
    const target = impulse.clone().normalize()
    const angle = Math.atan2(target.x, target.z) // y-axis rotation
    const current = quat(body.current.rotation())
    const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle)

    // smooth interpolation
    const lerped = new Quaternion().slerpQuaternions(current, q, 5 * delta)
    body.current.setRotation(lerped, true)
  })

  return (
    <RigidBody
      ref={body}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={initialPosition}
    >
      <BallCollider args={[0.6]} />
      <Player name={name} animate={walking} />
    </RigidBody>
  )
}
