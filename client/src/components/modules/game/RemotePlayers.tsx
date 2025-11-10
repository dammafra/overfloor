import type { PropsWithRoom } from '@hooks'
import { useTransition } from '@react-spring/three'
import type { GameSchema, PlayerSchema } from '@schema'
import { useGame } from '@stores'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import type { Vector3Tuple } from 'three'
import { RemotePlayer } from './RemotePlayer'

export function RemotePlayers({ room }: PropsWithRoom<GameSchema>) {
  const incrementPlayersCount = useGame(s => s.incrementPlayersCount)
  const decrementPlayersCount = useGame(s => s.decrementPlayersCount)
  const [players, setPlayers] = useState<PlayerSchema[]>([])

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd((player, sessionId) => {
      incrementPlayersCount()
      if (room.sessionId === sessionId) return
      setPlayers(players => [player, ...players.filter(p => p.username !== player.username)])
    })

    $(room.state).players.onRemove((player, sessionId) => {
      decrementPlayersCount()
      if (room.sessionId === sessionId) return
      setPlayers(players => players.filter(p => p.username !== player.username))
    })
  }, [room, incrementPlayersCount, decrementPlayersCount])

  const transition = useTransition(players, {
    from: { scale: 0 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return transition((spring, player) => (
    <RemotePlayer
      key={player.username}
      username={player.username}
      position={player.position.toArray() as Vector3Tuple}
      room={room}
      {...spring}
    />
  ))
}
