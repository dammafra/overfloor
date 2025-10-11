import { BlockCharacter } from '@components/models'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useController } from '@stores'
import { useRef, useState } from 'react'
import { Quaternion, Vector3 } from 'three'

function stringToHslColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = hash % 360
  return `hsl(${h}, ${70}%, ${50}%)`
}

interface PlayerProps {
  name: string
  position?: [number, number, number]
  enabled?: boolean
}

export function Player({ name, position, enabled = true }: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const { up, down, left, right } = useController()
  const [walking, setWalking] = useState(false)
  const [color] = useState(() => stringToHslColor(name))

  useFrame((_, delta) => {
    const safeDelta = Math.min(delta, 0.1)

    if (!body.current) return

    setWalking(up || down || left || right)

    const impulse = new Vector3()

    if (up) impulse.z -= 1
    if (down) impulse.z += 1
    if (right) impulse.x += 1
    if (left) impulse.x -= 1

    const impulseStrength = 30 * safeDelta
    impulse.normalize().multiplyScalar(impulseStrength)

    if (!impulse.equals(new Vector3())) {
      body.current.applyImpulse(impulse, true)

      // rotation toward direction
      const target = impulse.clone().normalize()
      const angle = Math.atan2(target.x, target.z) // y-axis rotation
      const current = quat(body.current.rotation())
      const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle)

      // smooth interpolation
      const lerped = new Quaternion().slerpQuaternions(current, q, 5 * delta)
      body.current.setRotation(lerped, true)
    }
  })

  return enabled ? (
    <RigidBody
      ref={body}
      colliders={false}
      position={position}
      enabledRotations={[false, false, false]}
    >
      <BallCollider args={[0.6]} />
      <BlockCharacter color={color} walk={walking} />(
      <Html
        center
        position-y={1}
        className="text-white rounded-full px-2 text-center whitespace-nowrap opacity-50"
        style={{ background: color?.toString() }}
      >
        {name}
      </Html>
      )
    </RigidBody>
  ) : (
    <BlockCharacter color={color} />
  )
}
