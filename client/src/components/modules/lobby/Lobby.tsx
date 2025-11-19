import { useRoom } from '@hooks'
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

  const setPhase = useGame(s => s.setPhase)

  const { room, error } = useRoom<GameLobbySchema>({
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

    setPhase('lobby')
  }, [from, room, options, setPhase, navigate])

  useEffect(() => {
    if (!error) return
    navigate('/')
  }, [error, navigate])

  return (
    <>
      {!training && <Countdown room={room} />}
      {!training && <Players room={room} />}
      <CameraRig room={room} />
    </>
  )
}
