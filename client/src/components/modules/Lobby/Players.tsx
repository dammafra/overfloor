import { Player } from '@components'
import type { PropsWithRoom } from '@hooks'
import { a, useTransition } from '@react-spring/three'
import { Float } from '@react-three/drei'
import type { GameLobbyState } from '@server/schema'
import { spiralPositionLobby } from '@utils'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'

export function Players({ room }: PropsWithRoom<GameLobbyState>) {
  const [players, setPlayers] = useState<string[]>([])

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd(player => setPlayers(players => [player, ...players.filter(p => p !== player)])) //prettier-ignore
    $(room.state).players.onRemove(player => setPlayers(players => players.filter(p => p !== player))) //prettier-ignore
  }, [room])

  const transitions = useTransition(players, {
    from: { scale: 0, position: [0, 0, 0] },
    enter: (_, i) => ({ scale: 1, position: spiralPositionLobby(i), delay: i * 50 }),
    update: (_, i) => ({ position: spiralPositionLobby(i) }),
    leave: { scale: 0, position: [0, 0, 0] },
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return transitions((spring, player) => (
    <a.group
      key={player}
      scale={spring.scale}
      position={spring.position.to((x, y, z) => [x, y, z])}
    >
      <Float floatIntensity={2} rotationIntensity={2} scale={0.5}>
        <Player username={player} />
      </Float>
    </a.group>
  ))
}
