import { Environment, Player } from '@components'
import { Tile } from '@components/modules/tiles'
import { type PropsWithRoom } from '@hooks'
import { a, useSpring } from '@react-spring/three'
import { Billboard, Float, Hud, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { GameSchema } from '@schema'
import { useGame } from '@stores'
import { getStateCallbacks, type SeatReservation } from 'colyseus.js'
import { useEffect } from 'react'
import { MathUtils } from 'three'
import { useParams } from 'wouter'

export function Leaderboard({ room }: PropsWithRoom<GameSchema>) {
  const { viewport } = useThree()

  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))
  // @ts-expect-error id and username are custom fields
  const { username } = reservation

  const leaderboard = useGame(s => s.leaderboard)
  const winner = leaderboard.at(0) === username
  const updateLeaderboard = useGame(s => s.updateLeaderboard)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).leaderboard.onAdd(updateLeaderboard)
  }, [room, updateLeaderboard])

  const tileSpring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: viewport.aspect > 2 ? 3 : 1.5, opacity: 0.8 },
  })

  const playerSpring = useSpring({
    from: { scale: 0 },
    to: { scale: 0.2 },
  })

  return (
    <Hud>
      <Environment />
      <PerspectiveCamera makeDefault position={[0, 0, 2]} />

      <mesh scale={100} position-y={2}>
        <planeGeometry />
        <a.meshBasicMaterial color="black" transparent opacity={tileSpring.opacity} />
      </mesh>

      <Tile
        scale={tileSpring.scale}
        rotation={[MathUtils.degToRad(90), MathUtils.degToRad(45), 0]}
      />

      <a.group
        scale={playerSpring.scale}
        position={[0, winner ? -0.4 : -0.5, 0.5]}
        rotation-y={winner ? 0 : -1}
      >
        <Billboard follow={winner}>
          <Float
            floatIntensity={winner ? 10 : 2}
            speed={winner ? 25 : 2}
            rotationIntensity={winner ? 1 : 0}
          >
            <Player username={username} />
          </Float>
        </Billboard>
      </a.group>
    </Hud>
  )
}
