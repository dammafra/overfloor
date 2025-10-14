import { Player } from '@components'
import type { PropsWithRoom } from '@hooks'
import { a, useTransition } from '@react-spring/three'
import { Float } from '@react-three/drei'
import type { GameLobbyState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { MathUtils, type Vector3Tuple } from 'three'

// TODO*: move to server or find a better way to implement `CameraRig`
export function spiralPosition(index: number): Vector3Tuple {
  const r = 1.5
  const angle = MathUtils.degToRad(index * 30) // adjust spacing
  const x = r * Math.sin(angle)
  const y = r * Math.cos(angle)
  const z = index * 0.5 // step outward
  return [x, y, z]
}

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
    enter: (_, i) => ({ scale: 1, position: spiralPosition(i), delay: i * 50 }),
    update: (_, i) => ({ position: spiralPosition(i) }),
    leave: _ => ({ scale: 0, position: [0, 0, 0] }),
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return transitions((style, player) => (
    <a.group key={player} scale={style.scale} position={style.position.to((x, y, z) => [x, y, z])}>
      <Float floatIntensity={2} rotationIntensity={2} scale={0.5}>
        <Player name={player} />
      </Float>
    </a.group>
  ))
}
