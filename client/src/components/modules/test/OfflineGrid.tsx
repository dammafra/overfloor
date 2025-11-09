import { Player } from '@components'
import { Tile } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { type CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { BallCollider, CuboidCollider, RigidBody } from '@react-three/rapier'
import {
  getGridCoordinates,
  getPlayerInitialPosition,
  GRID_UNIT,
  gridConfig,
  type GridDimension,
} from '@schema'
import { button, useControls } from 'leva'
import { useEffect, useMemo, useState } from 'react'
import { type Vector3Tuple } from 'three'
import { v4 as uuid } from 'uuid'
import { useLocation } from 'wouter'

export function OfflineGrid() {
  const [, navigate] = useLocation()

  const { dimension, playersCount } = useControls(
    'offline test',
    {
      dimension: {
        value: 'medium' as GridDimension,
        options: ['small', 'medium', 'large'] as GridDimension[],
      },
      playersCount: {
        value: gridConfig.medium.maxPlayers,
        min: 1,
        max: gridConfig.large.maxPlayers,
        step: 1,
      },
      EXIT: button(() => navigate('/')),
    },
    { order: 5 },
  )
  const width = useMemo(() => gridConfig[dimension].width, [dimension])
  const height = useMemo(() => gridConfig[dimension].height, [dimension])
  const [tiles, setTiles] = useState<Vector3Tuple[]>([])

  const { controls, size } = useThree()

  useEffect(() => {
    setTiles(getGridCoordinates(width, height).map(([x, z]) => [x, 0, z] as Vector3Tuple))
  }, [height, width])

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(0, true)
    cameraControls.dollyTo(width * 3, true)
  }, [width, controls, size])

  const transitions = useTransition(tiles, {
    from: tile => ({
      scale: 0,
      position: tile,
    }),
    enter: { scale: GRID_UNIT },
    leave: { scale: 0 },
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return (
    <>
      {/* tile meshes */}
      {transitions(spring => (
        <Tile {...spring} receiveShadow />
      ))}

      {/* tile bodies */}
      {tiles.map(tile => (
        <RigidBody key={`body-${uuid()}`} position={tile} type="fixed" colliders={false}>
          <CuboidCollider args={[GRID_UNIT * 0.5, 0.3, GRID_UNIT * 0.5]} />
        </RigidBody>
      ))}

      {/* players */}
      {Array.from({ length: playersCount }, (_, i) => (
        <RigidBody
          key={`player-${i}`}
          colliders={false}
          gravityScale={5}
          friction={0.5}
          linearDamping={0.4}
          enabledRotations={[false, false, false]}
          position={getPlayerInitialPosition(i, dimension)}
        >
          <BallCollider args={[0.6]} />
          <Player username={`player-${i}`} />
        </RigidBody>
      ))}
    </>
  )
}
