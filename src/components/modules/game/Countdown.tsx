import { LetterTile } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { Billboard } from '@react-three/drei'
import { useRoomState } from '@stores'
import { BOUNCY_CONFIG, COLORS } from '@utils'
import type { Vector3Tuple } from 'three'

export function Countdown() {
  const countdown = useRoomState(s => s.countdown)

  //oxfmt-ignore
  const colors = [
    COLORS.go,      // GO!
    COLORS.ready,   // 1
    COLORS.ready,   // 2
    COLORS.danger,  // 3
  ]

  const transitions = useTransition(countdown, {
    from: { scale: 5, position: [0, 0, 50] as Vector3Tuple, rotationX: 4 },
    enter: { scale: 5, position: [0, 5, 5] as Vector3Tuple, rotationX: 0 },
    leave: { scale: 0, position: [0, 0, -50] as Vector3Tuple, rotationX: -4 },
    config: BOUNCY_CONFIG,
  })

  return transitions(
    (spring, countdown) =>
      typeof countdown === 'number' &&
      countdown >= 0 && (
        <Billboard>
          <LetterTile
            {...spring}
            rotation-x={spring.rotationX}
            rotation-z={0}
            color={colors[countdown]}
          >
            {countdown ? countdown : 'GO!'}
          </LetterTile>
        </Billboard>
      ),
  )
}
