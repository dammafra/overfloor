import { useColyseus } from '@hooks'
import { GameLobbyState } from '@server/schema'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useLocation, useParams } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'
import { RoomTitle } from './RoomTitle'

export function Lobby() {
  const { options } = useParams()
  const { id, username, training, countdown } = JSON.parse(atob(options!))
  const [, navigate] = useLocation()

  const { room, error } = useColyseus<GameLobbyState>({
    roomName: 'game-lobby',
    roomId: training ? undefined : id,
    options: { id, username, training, countdown },
  })

  useEffect(() => {
    if (!room) return

    room.onMessage('start', reservation => {
      navigate(`/game/${btoa(JSON.stringify(reservation))}`, { replace: true })
    })
  }, [room, options, navigate])

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
    navigate('/')
  }, [error, navigate])

  return (
    <>
      <Countdown room={room} />
      <Players room={room} />
      <RoomTitle />
      <CameraRig room={room} />
    </>
  )
}
