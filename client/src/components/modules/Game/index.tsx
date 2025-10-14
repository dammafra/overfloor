import { useColyseus } from '@hooks'
import type { GameState } from '@server/schema'
import type { SeatReservation } from 'colyseus.js'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useLocation, useParams } from 'wouter'
import { Floor } from './Floor'
import { LocalPlayer } from './LocalPlayer'
import { RemotePlayers } from './RemotePlayers'

export function Game() {
  const params = useParams()
  const [, navigate] = useLocation()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))

  const { room, error } = useColyseus<GameState>({ roomName: 'game-room', reservation })

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
    navigate('/')
  }, [error])

  return (
    <>
      <LocalPlayer room={room} />
      <RemotePlayers room={room} />
      <Floor unit={2} width={9} height={7} gap={0.1} />
    </>
  )
}
