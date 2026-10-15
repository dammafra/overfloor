import { LetterTile } from '@components/modules/tiles'
import { useTransition } from '@react-spring/three'
import { Billboard } from '@react-three/drei'
import { useGame, useRoomState } from '@stores'
import { useEffect } from 'react'
import { MathUtils, type Vector3Tuple } from 'three'

export function Countdown() {
  const setPhase = useGame(s => s.setPhase)
  const countdown = useRoomState(s => s.countdown)

  //oxfmt-ignore
  const colors = [
    'limegreen',  // GO!
    'orange',     // 1
    'orange',     // 2
    'brown',      // 3
  ]

  useEffect(() => setPhase('countdown'), [setPhase])

  useEffect(() => {
    if (countdown !== null && countdown <= 0) setPhase('started')
  }, [countdown, setPhase])

  const transitions = useTransition(countdown, {
    from: { scale: 5, position: [0, 0, 50] as Vector3Tuple, rotationX: 4 },
    enter: { scale: 5, position: [0, 5, 5] as Vector3Tuple, rotationX: 0 },
    leave: { scale: 0, position: [0, 0, -50] as Vector3Tuple, rotationX: -4 },
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return transitions(
    (spring, countdown) =>
      typeof countdown === 'number' &&
      countdown >= 0 && (
        <Billboard>
          <LetterTile
            {...spring}
            rotation-x={spring.rotationX}
            rotation-z={MathUtils.degToRad(0)}
            color={colors[countdown]}
          >
            {countdown ? countdown : 'GO!'}
          </LetterTile>
        </Billboard>
      ),
  )
}
