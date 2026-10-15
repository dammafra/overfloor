import { useRoomState } from '@stores'
import { Tile } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { GameLoopPhase, GRID_UNIT } from '@schema'
import { useMemo } from 'react'

export function Grid() {
  const defaultColor = 'dodgerblue'

  //oxfmt-ignore
  const phaseColors = [
    defaultColor,   // IDLE
    'limegreen',    // COUNTDOWN_3
    'orange',       // COUNTDOWN_2
    'brown',        // COUNTDOWN_1
    defaultColor,   // FALLING
  ]

  const phase = useRoomState(s => s.phase)
  const tiles = useRoomState(s => s.tiles)
  const safeTiles = useMemo(
    () => tiles.filter(t => !t.disabled && (phase !== GameLoopPhase.FALLING || !t.targeted)),
    [tiles, phase],
  )

  const transitions = useTransition(safeTiles, {
    keys: tile => tile.id,
    from: tile => ({
      scale: 0,
      color: defaultColor,
      position: tile.position,
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
        <RigidBody key={`body-${tile.id}`} position={tile.position} type="fixed" colliders={false}>
          <CuboidCollider args={[GRID_UNIT * 0.5, 0.3, GRID_UNIT * 0.5]} />
        </RigidBody>
      ))}
    </>
  )
}
