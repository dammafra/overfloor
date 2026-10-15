import { Environment, Player } from '@components'
import { useLobbyOptions } from '@hooks'
import { useLobbyPlayers } from '@multiplayer'
import { a, useTransition } from '@react-spring/three'
import { Float, Hud } from '@react-three/drei'
import { positions } from '@utils'
import type { Vector3Tuple } from 'three'

export function Players() {
  const training = useLobbyOptions()?.training

  const players = useLobbyPlayers()

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
        // @ts-ignore
        <a.group scale={spring.scale} position={spring.position}>
          <Float floatIntensity={2} rotationIntensity={2}>
            <Player username={player} showUsername={!training} />
          </Float>
        </a.group>
      ))}
    </Hud>
  )
}
