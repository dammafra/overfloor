import { Environment, Player } from '@components'
import type { PropsWithRoom } from '@hooks'
import { a, useTransition } from '@react-spring/three'
import { Float, Hud } from '@react-three/drei'
import type { GameLobbySchema } from '@schema'
import { positions } from '@utils'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import type { Vector3Tuple } from 'three'
import { useParams } from 'wouter'

export function Players({ room }: PropsWithRoom<GameLobbySchema>) {
  const { options } = useParams()
  const { training } = JSON.parse(atob(options!))

  const [players, setPlayers] = useState<string[]>([])

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd(player => setPlayers(players => [player, ...players.filter(p => p !== player)])) //prettier-ignore
    $(room.state).players.onRemove(player => setPlayers(players => players.filter(p => p !== player))) //prettier-ignore
  }, [room])

  const transitions = useTransition(players, {
    from: { scale: 0, position: [0, 0, 0] as Vector3Tuple },
    enter: (_, i) => ({ scale: 0.5, position: positions.lobby.player(i), delay: i * 50 }),
    update: (_, i) => ({ position: positions.lobby.player(i) }),
    leave: { scale: 0, position: [0, 0, 0] as Vector3Tuple },
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return (
    <Hud renderPriority={1}>
      <Environment />
      {transitions((spring, player) => (
        <a.group scale={spring.scale} position={spring.position}>
          <Float floatIntensity={2} rotationIntensity={2}>
            <Player username={player} showUsername={!training} />
          </Float>
        </a.group>
      ))}
    </Hud>
  )
}
