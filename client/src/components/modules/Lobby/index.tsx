import { useColyseus } from '@hooks'
import { GameLobbyState } from '@server/schema'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useLocation, useParams } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'

export function Lobby() {
  const { from, options } = useParams()
  const [, navigate] = useLocation()
  const { id, username, debug, countdown } = JSON.parse(atob(options!))

  const { room, error } = useColyseus<GameLobbyState>({
    roomId: from === 'new' ? undefined : id,
    roomName: 'game-lobby',
    options: { id, username, debug, countdown },
  })

  useEffect(() => {
    if (!room) return

    room.onMessage('start', reservation => {
      navigate(`/game/${btoa(JSON.stringify(reservation))}`, { replace: true })
    })
  }, [room, navigate])

  useEffect(() => {
    if (!error || !from) return
    toast.error(error.message)
    navigate(`/${from}`, { replace: true })
  }, [error, from, navigate])

  return (
    <>
      <Countdown room={room} />
      <Players room={room} />
      <CameraRig room={room} />
    </>
  )
}
