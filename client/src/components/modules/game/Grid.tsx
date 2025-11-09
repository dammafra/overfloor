import { Tile } from '@components/modules/tiles'
import { type PropsWithRoom } from '@hooks'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { GameState, TileState } from '@schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import type { Vector3Tuple } from 'three'

export function Grid({ room }: PropsWithRoom<GameState>) {
  // prettier-ignore
  const phaseColors = [
    undefined,      // IDLE
    'green',        // COUNTDOWN_3
    'orange',       // COUNTDOWN_2
    'brown',        // COUNTDOWN_1
    undefined,      // FALLING
  ]

  const [unit, setUnit] = useState<number>(0)
  const [tiles, setTiles] = useState<TileState[]>([])

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('unit', setUnit)

    $(room.state).tiles.onAdd(tile => {
      setTiles(tiles => [tile, ...tiles.filter(t => t.id !== tile.id)])

      $(tile).listen('falling', falling => {
        setTiles(tiles =>
          falling
            ? tiles.filter(t => t.id !== tile.id)
            : [tile, ...tiles.filter(t => t.id !== tile.id)],
        )
      })

      $(tile).listen('phase', phase => {
        setTiles(tiles =>
          tiles.map(t => {
            if (t.id === tile.id) t.phase = phase
            return t
          }),
        )
      })
    })
  }, [room])

  const transitions = useTransition(tiles, {
    from: tile => ({
      scale: 0,
      position: tile.position.toArray() as Vector3Tuple,
    }),
    enter: { scale: unit },
    leave: { scale: 0 },
    update: tile => ({ color: phaseColors[tile.phase] }),
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
          position={tile.position.toArray() as Vector3Tuple}
          type="fixed"
          colliders={false}
        >
          <CuboidCollider args={[unit * 0.5, 0.3, unit * 0.5]} />
        </RigidBody>
      ))}
    </>
  )
}
