import { useColyseus } from '@hooks'
import { GameLobbySchema } from '@schema'
import { useGame } from '@stores'
import { useEffect } from 'react'
import { useLocation, useParams } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'

export function Lobby() {
  const { from, options } = useParams()
  const { id, username, training, countdown } = JSON.parse(atob(options!))
  const [, navigate] = useLocation()

  const lobby = useGame(s => s.lobby)

  const { room, error } = useColyseus<GameLobbySchema>({
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
      lobby()
      navigate(`/game/${btoa(JSON.stringify(reservation))}`, { replace: true })
    })
  }, [from, room, options, lobby, navigate])

  useEffect(() => {
    if (!error) return
    navigate('/')
  }, [error, navigate])

  return (
    <>
      <Countdown room={room} />
      <Players room={room} />
      <CameraRig room={room} />
    </>
  )
}
