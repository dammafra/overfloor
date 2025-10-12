import { useColyseus } from '@hooks'
import { a, useTransition } from '@react-spring/three'
import { CameraControls, Float, Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { GameLobbyState } from '@server/schema'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { MathUtils } from 'three'
import { useLocation, useParams } from 'wouter'
import { Player } from './Player'

function spiralPosition(index: number) {
  const r = 1.5
  const angle = MathUtils.degToRad(index * 30) // adjust spacing
  const x = r * Math.sin(angle)
  const y = r * Math.cos(angle)
  const z = index * 0.5 // step outward
  return [x, y, z]
}

export function Lobby() {
  const { controls, viewport } = useThree()

  const { from, options } = useParams()
  const [, navigate] = useLocation()
  const { id, username } = JSON.parse(atob(options!))

  const { room, state, error } = useColyseus<GameLobbyState>({
    roomId: from === 'new' ? undefined : id,
    roomName: 'game-lobby',
    options: { id, username },
  })

  const [players, setPlayers] = useState<string[]>([])

  useEffect(() => {
    if (!room) return
    room.onMessage('start', reservation => navigate(`/game/${btoa(JSON.stringify(reservation))}`, { replace: true })) //prettier-ignore
  }, [room])

  useEffect(() => {
    if (!state || !state.players) return
    setPlayers(Array.from(state.players.values()))
  }, [state])

  useEffect(() => {
    if (!error || !from) return
    toast.error(error.message)
    navigate(`/${from}`, { replace: true })
  }, [error, from, navigate])

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    const [, , z] = spiralPosition(players.length - 1)
    cameraControls.dollyTo(z + (viewport.aspect > 1 ? 5 : 10), true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(90), true)
  }, [controls, players, viewport])

  const transitions = useTransition(players, {
    from: { scale: 0, position: [0, 0, 0] },
    enter: (_, i) => ({ scale: 1, position: spiralPosition(i), delay: i * 50 }),
    update: (_, i) => ({ position: spiralPosition(i) }),
    leave: (_, i) => ({ scale: 0, position: spiralPosition(i), delay: i * 50 }),
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return (
    <>
      <Float floatIntensity={2} rotationIntensity={2}>
        <Html
          center
          occlude="blending"
          className="flex flex-col items-center justify-center size-44 aspect-square rounded-full text-center text-white font-bold bg-slate-400"
        >
          {state?.canStart ? (
            <>
              <p>Match starts in...</p>
              <p className="text-7xl">{state?.countdown}</p>
            </>
          ) : (
            <p>Waiting for opponents...</p>
          )}
        </Html>
      </Float>
      {transitions((style, player) => (
        <a.group
          key={player}
          scale={style.scale}
          position={style.position.to((x, y, z) => [x, y, z])}
        >
          <Float floatIntensity={2} rotationIntensity={2} scale={0.5}>
            <Player name={player} />
          </Float>
        </a.group>
      ))}
    </>
  )
}
