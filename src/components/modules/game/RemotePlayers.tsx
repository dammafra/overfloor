import { useTransition } from '@react-spring/three'
import { useRoomState } from '@stores'
import { myPlayer, usePlayersList } from 'playroomkit'
import { RemotePlayer } from './RemotePlayer'

export function RemotePlayers() {
  const players = useRoomState(s => s.players)
  const participants = usePlayersList()

  const remotePlayers = players.filter(p => p.id !== myPlayer()?.id)

  const transition = useTransition(remotePlayers, {
    keys: player => player.id,
    from: { scale: 0 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return transition((spring, player) => (
    <RemotePlayer
      key={player.id}
      username={player.username}
      position={player.position}
      state={participants.find(p => p.id === player.id)}
      {...spring}
    />
  ))
}
