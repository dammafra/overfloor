import { Tile } from '@components/Tile'
import { type PropsWithRoom } from '@hooks'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import type { GameState, TileState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import type { Vector3Tuple } from 'three'

export function Grid({ room }: PropsWithRoom<GameState>) {
  const defaultColor = 'white'

  // prettier-ignore
  const phaseColors = [
    defaultColor,   // TARGETING
    'green',        // COUNTDOWN_3
    'orange',       // COUNTDOWN_2
    'red',          // COUNTDOWN_1
    defaultColor,   // FALLING
    defaultColor,   // RESET
  ]

  const [unit, setUnit] = useState<number>(0)
  const [tiles, setTiles] = useState<TileState[]>([])

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('grid', grid => {
      setUnit(grid.unit)
    })

    $(room.state).tiles.onAdd(tile => {
      setTiles(tiles => [tile, ...tiles.filter(t => t.index !== tile.index)])

      $(tile).listen('falling', falling => {
        setTiles(tiles =>
          falling
            ? tiles.filter(t => t.index !== tile.index)
            : [tile, ...tiles.filter(t => t.index !== tile.index)],
        )
      })

      $(tile).listen('phase', phase => {
        setTiles(tiles =>
          tiles.map(t => {
            if (t.index === tile.index) t.phase = phase
            return t
          }),
        )
      })
    })
  }, [room])

  const transitions = useTransition(tiles, {
    from: { scale: 0.1 },
    enter: () => ({ scale: 1 }),
    leave: () => ({ scale: 0 }),
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return (
    <>
      {/* meshes */}
      {transitions((spring, tile) => (
        <Tile
          key={`mesh-${tile.index}`}
          receiveShadow
          position={tile.position.toArray() as Vector3Tuple}
          scale={spring.scale}
          unit={unit}
          color={phaseColors[tile.phase]}
        />
      ))}

      {/* bodies */}
      {tiles.map(tile => (
        <RigidBody
          key={`body-${tile.index}`}
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
