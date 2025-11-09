import { Tile } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { BallCollider, CuboidCollider, RigidBody } from '@react-three/rapier'
import { positions } from '@utils'
import { useEffect, useState } from 'react'
import { Box3, Vector3, type Vector3Tuple } from 'three'
import { generateUUID } from 'three/src/math/MathUtils.js'
import { Player } from '../../Player'

interface OfflineTileState {
  id: string
  position: Vector3Tuple
}

export function OfflineGrid() {
  const [width] = useState(9)
  const [height] = useState(6)
  const [gap] = useState(0.15)
  const [unit] = useState<number>(2.5)
  const [tiles, setTiles] = useState<OfflineTileState[]>([])
  const [playersCount] = useState(50)

  const { controls, size } = useThree()

  useEffect(() => {
    const offsetX = (width - 1) * (unit + gap) * 0.5
    const offsetZ = (height - 1) * (unit + gap) * 0.5

    const tiles: OfflineTileState[] = []
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const x = i * (unit + gap) - offsetX
        const z = j * (unit + gap) - offsetZ
        tiles.push({
          id: generateUUID(),
          position: [x, 0, z] as Vector3Tuple,
        })
      }
    }

    setTiles(tiles)
  }, [])

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    const center = new Vector3()

    const padding = 1
    const xDimension = width * (unit + gap) + padding
    const zDimension = height * (unit + gap) + padding
    const size = new Vector3(xDimension, 1, zDimension)

    const boundingBox = new Box3().setFromCenterAndSize(center, size)

    cameraControls.fitToBox(boundingBox, true)
    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(Math.PI * 0.25, true)
  }, [gap, height, unit, width, controls, size])

  const transitions = useTransition(tiles, {
    from: tile => ({
      scale: 0,
      position: tile.position as Vector3Tuple,
    }),
    enter: { scale: unit },
    leave: { scale: 0 },
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return (
    <>
      {/* meshes */}
      {transitions(spring => (
        <Tile {...spring} receiveShadow />
      ))}

      {/* bodies */}
      {tiles.map(tile => (
        <RigidBody
          key={`body-${tile.id}`}
          position={tile.position as Vector3Tuple}
          type="fixed"
          colliders={false}
        >
          <CuboidCollider args={[unit * 0.5, 0.3, unit * 0.5]} />
        </RigidBody>
      ))}

      {Array.from({ length: playersCount }, (_, i) => (
        <RigidBody
          key={`player-${i}`}
          colliders={false}
          gravityScale={5}
          friction={0.5}
          linearDamping={0.4}
          enabledRotations={[false, false, false]}
          position={positions.game.player(i)}
        >
          <BallCollider args={[0.6]} />
          <Player username={`player-${i}`} />
        </RigidBody>
      ))}
    </>
  )
}
