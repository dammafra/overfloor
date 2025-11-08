import { LetterTile } from '@components/modules/tiles'
import type { PropsWithRoom } from '@hooks'
import { useTransition } from '@react-spring/three'
import { Billboard } from '@react-three/drei'
import type { GameState } from '@schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { MathUtils, type Vector3Tuple } from 'three'

export function Countdown({ room }: PropsWithRoom<GameState>) {
  const [countdown, setCountdown] = useState<number>()

  // prettier-ignore
  const colors = [
    'white',      // GO!
    'brown',      // 1
    'orange',     // 2
    'green',      // 3
  ]

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('countdown', setCountdown)
  }, [room])

  const transitions = useTransition(countdown, {
    from: { scale: 5, position: [0, 0, 50] as Vector3Tuple, rotationX: 4 },
    enter: { scale: 5, position: [0, 5, 5] as Vector3Tuple, rotationX: 0 },
    leave: { scale: 0, position: [0, 0, -50] as Vector3Tuple, rotationX: -4 },
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return transitions(
    (spring, countdown) =>
      typeof countdown !== 'undefined' &&
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
