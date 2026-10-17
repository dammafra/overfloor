import { Tile, TileLabel } from '@components/modules/tiles'
import { a, useSpring } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { BOUNCY_CONFIG } from '@utils'
import { Suspense, useRef } from 'react'
import { MathUtils, Vector3, type Group } from 'three'

// distance from the camera, and turns per second
const DISTANCE = 4
const SPIN_SPEED = 0.5

const direction = new Vector3()

// spinning tile shown while the scene loads: in front of the camera wherever it is, the camera
// rigs are loading too
export function Loader() {
  const ref = useRef<Group>(null)
  const spinRef = useRef<Group>(null)

  const { scale } = useSpring({ from: { scale: 0 }, to: { scale: 1 }, config: BOUNCY_CONFIG })

  useFrame(({ camera }, delta) => {
    if (!ref.current || !spinRef.current) return

    camera.getWorldDirection(direction)
    ref.current.position.copy(camera.position).addScaledVector(direction, DISTANCE)
    ref.current.quaternion.copy(camera.quaternion)
    spinRef.current.rotation.y += delta * SPIN_SPEED * Math.PI * 2
  })

  return (
    <group ref={ref}>
      <a.group ref={spinRef} scale={scale}>
        {/* diagonal, top face towards the camera */}
        <group rotation={[0, 0, MathUtils.degToRad(45)]}>
          <Tile float={false} rotation={[MathUtils.degToRad(90), 0, 0]}>
            {/* the tile shows up before the font is loaded */}
            <Suspense>
              {/* horizontal across the tile */}
              <group rotation={[0, MathUtils.degToRad(-45), 0]}>
                <TileLabel
                  anchorY="middle"
                  fontSize={0.14}
                  rotation={[MathUtils.degToRad(-90), 0, 0]}
                >
                  LOADING
                </TileLabel>
              </group>
            </Suspense>
          </Tile>
        </group>
      </a.group>
    </group>
  )
}
