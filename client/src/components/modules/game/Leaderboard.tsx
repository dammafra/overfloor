import { Environment, Player } from '@components'
import { Tile } from '@components/modules/tiles'
import { useConfetti, type PropsWithRoom } from '@hooks'
import { a, useSpring } from '@react-spring/three'
import { a as aWeb, useSpring as useWebSpring } from '@react-spring/web'
import { Billboard, Float, Html, Hud, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { GameState } from '@schema'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { MathUtils } from 'three'
import { useLocation } from 'wouter'

export function Leaderboard({ room }: PropsWithRoom<GameState>) {
  const [, navigate] = useLocation()
  const [leaderboard, setLeaderboard] = useState<string[]>([])

  const { viewport } = useThree()
  const burst = useConfetti()

  useEffect(() => {
    if (!room) return
    setLeaderboard(room.state.leaderboard.toArray().reverse())
  }, [room, navigate])

  const tileSpring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: viewport.aspect > 2 ? 3 : 1.5, opacity: 0.8 },
  })

  const playerSpring = useSpring({
    from: { scale: 0 },
    to: { scale: 0.2 },
  })

  const webSpring = useWebSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    onRest: burst,
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

      <a.group scale={playerSpring.scale} position={[0, -0.5, 0.5]}>
        <Billboard>
          <Float floatIntensity={10} speed={25} rotationIntensity={1}>
            <Player username={leaderboard.at(0)} />
          </Float>
        </Billboard>
      </a.group>

      <Html center wrapperClass="fixed inset-0" className="absolute inset-0">
        <aWeb.div style={webSpring} className="page gap-4 text-white text-stroke-black">
          <h1 className="text-4xl bg-white/40 py-2 px-4 rounded-xl">LEADERBOARD</h1>

          <ol className="list-decimal list-inside text-xl w-full max-w-80 h-60 overflow-scroll fade-bottom">
            {leaderboard.map((player, i) => (
              <li
                key={`leaderboard-player-${i}`}
                className={clsx(i === 0 && 'text-3xl text-amber-400')}
              >
                {player} {i === 0 && <span className="icon-[mdi--crown] float-right mt-1" />}
              </li>
            ))}
          </ol>

          <button className="button danger" onClick={() => navigate('/')}>
            back
          </button>
        </aWeb.div>
      </Html>
    </Hud>
  )
}
