import { Controller, Floor, Player } from '@components'
import { useColyseus } from '@hooks'
import type { GameState, PlayerState } from '@server/schema'
import type { SeatReservation } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useParams } from 'wouter'

export function World() {
  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))

  const { state, error } = useColyseus<GameState>({
    roomName: 'game-room',
    reservation,
  })

  const [players, setPlayers] = useState<PlayerState[]>([])

  useEffect(() => {
    if (!state || !state.players) return
    setPlayers(Array.from(state.players.values()))
  }, [state])

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <Controller>
        {players.map(player => (
          <Player
            key={player.username}
            name={player.username}
            enabled={player.sessionId === reservation.sessionId}
            position={[0, 3, 0]}
          />
        ))}
      </Controller>

      <Floor unit={2} width={9} height={7} gap={0.1} />
    </>
  )
}
