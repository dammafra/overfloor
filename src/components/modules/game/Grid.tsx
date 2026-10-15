import { Tile } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { GameLoopPhase, GRID_UNIT } from '@schema'
import { useRoomState } from '@stores'
import { BOUNCY_CONFIG, COLOR_CONFIG, COLORS } from '@utils'

export function Grid() {
  const defaultColor = COLORS.tile

  //oxfmt-ignore
  const phaseColors = [
    defaultColor,   // IDLE
    COLORS.go,      // COUNTDOWN_3
    COLORS.ready,   // COUNTDOWN_2
    COLORS.danger,  // COUNTDOWN_1
    defaultColor,   // FALLING
  ]

  const phase = useRoomState(s => s.phase)
  const tiles = useRoomState(s => s.tiles)
  const safeTiles = tiles.filter(
    t => !t.disabled && (phase !== GameLoopPhase.FALLING || !t.targeted),
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
    update: tile => ({
      color: tile.targeted ? phaseColors[phase] : defaultColor,
      config: COLOR_CONFIG,
    }),
    config: BOUNCY_CONFIG,
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
