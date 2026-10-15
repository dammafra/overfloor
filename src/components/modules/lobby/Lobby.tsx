import { useLobbyOptions } from '@hooks'
import { connect } from '@multiplayer'
import { PLAYER } from '@schema'
import { useRoomState } from '@stores'
import { lobbyPath, type LobbyOptions } from '@utils'
import { getRoomCode, myPlayer } from 'playroomkit'
import { useEffect, useState } from 'react'
import { Redirect, useLocation, useParams } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'

export function Lobby() {
  const options = useLobbyOptions()
  return options ? <LobbyRoom {...options} /> : <Redirect to="/" replace />
}

function LobbyRoom({ id, username, training, countdown, rematch }: LobbyOptions) {
  const { from } = useParams()
  const [, navigate] = useLocation()

  const [connected, setConnected] = useState(false)

  const stage = useRoomState(s => s.stage)
  const players = useRoomState(s => s.players)

  useEffect(() => {
    connect({ roomCode: id, username, training, countdown }).then(() => {
      setConnected(true)

      if (from === 'new') {
        navigate(lobbyPath('join', { id: getRoomCode(), username, training, rematch }), {
          replace: true,
        })
      }
    })
  }, [from, id, username, training, countdown, rematch, navigate])

  useEffect(() => {
    if (!connected) return

    myPlayer().setState(PLAYER.inLobby, true, true)

    return () => myPlayer()?.setState(PLAYER.inLobby, false, true)
  }, [connected])

  useEffect(() => {
    if (!connected || stage !== 'game') return
    if (players.some(p => p.id === myPlayer().id)) navigate('/game', { replace: true })
  }, [connected, stage, players, navigate])

  return (
    <>
      {!training && <Countdown />}
      {!training && <Players />}
      <CameraRig />
    </>
  )
}
