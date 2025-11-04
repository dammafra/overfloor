import { Tile } from '@components'
import { type PropsWithRoom } from '@hooks'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { GameState, TileState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import type { Vector3Tuple } from 'three'

export function Grid({ room }: PropsWithRoom<GameState>) {
  // TODO improve
  const defaultColor = 'dodgerblue'

  // prettier-ignore
  const phaseColors = [
    defaultColor,   // IDLE
    'green',        // COUNTDOWN_3
    'orange',       // COUNTDOWN_2
    'brown',        // COUNTDOWN_1
    defaultColor,   // FALLING
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
    from: { scale: 0.1, color: defaultColor },
    enter: () => ({ scale: unit }),
    leave: () => ({ scale: 0 }),
    update: tile => ({ color: phaseColors[tile.phase] }),
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return (
    <>
      {/* meshes */}
      {transitions((spring, tile) => (
        <Tile
          key={`mesh-${tile.id}`}
          color={spring.color}
          position={tile.position.toArray() as Vector3Tuple}
          scale={spring.scale}
          receiveShadow
        />
      ))}

      {/* bodies */}
      {tiles.map(tile => (
        <RigidBody
          key={`body-${tile.id}`}
          position={tile.position.toArray() as Vector3Tuple}
          type="fixed"
          colliders={false}
        >
          <CuboidCollider args={[unit * 0.5, 0.25 * 0.5, unit * 0.5]} />
        </RigidBody>
      ))}
    </>
  )
}
