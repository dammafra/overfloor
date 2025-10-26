import { useColyseus } from '@hooks'
import { GameLobbyState } from '@server/schema'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useLocation, useParams } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'
import { Title } from './Title'

export function Lobby() {
  const { from, options } = useParams()
  const { id, username, training, countdown } = JSON.parse(atob(options!))
  const [, navigate] = useLocation()

  const { room, error } = useColyseus<GameLobbyState>({
    roomId: from === 'new' ? undefined : id,
    roomName: 'game-lobby',
    options: { id, username, training, countdown },
  })

  useEffect(() => {
    if (!room) return

    if (from === 'new') {
      navigate(`/join/lobby/${options}`)
    }

    room.onMessage('start', reservation => {
      navigate(`/game/${btoa(JSON.stringify(reservation))}`, { replace: true })
    })
  }, [room, from, options, navigate])

  useEffect(() => {
    if (!error || !from) return
    toast.error(error.message)
    navigate(`/${from}`, { replace: true })
  }, [error, from, navigate])

  return (
    <>
      <Title />
      <Countdown room={room} />
      <Players room={room} />
      <CameraRig room={room} />
    </>
  )
}
