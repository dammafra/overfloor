import { Tile } from '@components/modules/tiles'
import { type PropsWithRoom } from '@hooks'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { GameLoopPhase, GRID_UNIT, type GameSchema, type TileSchema } from '@schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useMemo, useState } from 'react'
import type { Vector3Tuple } from 'three'

export function Grid({ room }: PropsWithRoom<GameSchema>) {
  const defaultColor = 'dodgerblue'

  // prettier-ignore
  const phaseColors = [
    defaultColor,   // IDLE
    'limegreen',    // COUNTDOWN_3
    'orange',       // COUNTDOWN_2
    'brown',        // COUNTDOWN_1
    defaultColor,   // FALLING
  ]

  const [phase, setPhase] = useState<GameLoopPhase>(GameLoopPhase.IDLE)
  const [tiles, setTiles] = useState<TileSchema[]>([])
  const safeTiles = useMemo(
    () => tiles.filter(t => phase !== GameLoopPhase.FALLING || !t.targeted),
    [tiles, phase],
  )

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('phase', setPhase)

    $(room.state).tiles.onAdd(tile => {
      setTiles(tiles => [tile, ...tiles.filter(t => t.id !== tile.id)])

      $(tile).listen('targeted', targeted => {
        setTiles(tiles =>
          tiles.map(t => {
            if (t.id === tile.id) t.targeted = targeted
            return t
          }),
        )
      })

      $(tile).listen('disabled', disabled => {
        setTiles(tiles =>
          disabled
            ? tiles.filter(t => t.id !== tile.id)
            : [tile, ...tiles.filter(t => t.id !== tile.id)],
        )
      })
    })
  }, [room])

  const transitions = useTransition(safeTiles, {
    from: tile => ({
      scale: 0,
      color: defaultColor,
      position: tile.position.toArray() as Vector3Tuple,
    }),
    enter: { scale: GRID_UNIT },
    leave: { scale: 0 },
    update: tile => ({ color: tile.targeted ? phaseColors[phase] : defaultColor }),
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return (
    <>
      {/* meshes */}
      {transitions(spring => (
        <Tile {...spring} receiveShadow />
      ))}

      {/* bodies */}
      {safeTiles.map(tile => (
        <RigidBody
          key={`body-${tile.id}`}
          position={tile.position.toArray() as Vector3Tuple}
          type="fixed"
          colliders={false}
        >
          <CuboidCollider args={[GRID_UNIT * 0.5, 0.3, GRID_UNIT * 0.5]} />
        </RigidBody>
      ))}
    </>
  )
}
