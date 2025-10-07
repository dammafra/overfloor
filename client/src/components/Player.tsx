import { Html, KeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useRef, useState } from 'react'
import { Quaternion, Vector3, type ColorRepresentation } from 'three'
import useController from '../stores/use-controller'
import { randomColor } from '../utils/random'
import BlockCharacter from './models/BlockCharacter'

interface PlayerProps {
  name: string
  color?: ColorRepresentation
  x?: number
  y?: number
}

export default function Player({ name, color = randomColor(), x = 0, y = 0 }: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const { up, down, left, right } = useController()
  const [walking, setWalking] = useState(false)

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

  return (
    <KeyboardControls
      map={[
        { name: 'up', keys: ['ArrowUp', 'KeyW'] },
        { name: 'down', keys: ['ArrowDown', 'KeyS'] },
        { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      ]}
    >
      <RigidBody
        ref={body}
        colliders={false}
        position={[x, 3, y]}
        enabledRotations={[false, false, false]}
      >
        <BallCollider args={[0.6]} />
        <BlockCharacter color={color} walk={walking} />
        <Html
          center
          position-y={1}
          className="text-white rounded-full px-2 text-center whitespace-nowrap opacity-50"
          style={{ background: color?.toString() }}
        >
          {name}
        </Html>
      </RigidBody>
    </KeyboardControls>
  )
}
