import type { PropsWithRoom } from '@hooks'
import type { GameState, PlayerState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { RemotePlayer } from './RemotePlayer'

export function RemotePlayers({ room }: PropsWithRoom<GameState>) {
  const [players, setPlayers] = useState<PlayerState[]>([])

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd((player, sessionId) => {
      if (room.sessionId === sessionId) return
      setPlayers(players => [player, ...players.filter(p => p.username !== player.username)])
    })

    $(room.state).players.onRemove((player, sessionId) => {
      if (room.sessionId === sessionId) return
      setPlayers(players => players.filter(p => p.username !== player.username))
    })
  }, [room])

  return players.map(player => (
    <RemotePlayer
      key={player.username}
      username={player.username}
      index={player.index}
      room={room}
    />
  ))
}
