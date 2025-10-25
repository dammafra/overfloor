import { useSprings } from '@react-spring/three'
import { Float } from '@react-three/drei'
import { spiralPositionLobby } from '@utils'
import { type EulerTuple, type Vector3Tuple } from 'three'
import { useRoute } from 'wouter'
import { Tile } from './Tile'

export function Temp() {
  const [matchLobby] = useRoute(/lobby/)
  // const ref = useRef<Mesh>(null)

  // useFrame((_, delta) => {
  //   if (!ref.current) return
  //   ref.current.rotation.x += delta * 0.5
  //   ref.current.rotation.y += delta * 0.25
  //   ref.current.rotation.z += delta * 0.125
  // })

  const [springs] = useSprings<{ position: Vector3Tuple; rotation: EulerTuple | undefined }>(
    10,
    i => ({
      position: matchLobby ? spiralPositionLobby(i, 3) : [i - 5, 0, i * 2],
      rotation: matchLobby ? [1, 2, 3] : undefined,
      config: { mass: 1, tension: 120, friction: 14 },
    }),
    [matchLobby],
  )

  return springs.map((spring, i) => (
    <Float
      key={`menu-tile-${i}`}
      floatIntensity={matchLobby ? 0 : 5}
      rotationIntensity={matchLobby ? 0 : 10}
    >
      <Tile position={spring.position} />
    </Float>
  ))
}
