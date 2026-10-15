import { useLobbyOptions } from '@hooks'
import { connect } from '@multiplayer'
import { PLAYER } from '@schema'
import { useRoomState } from '@stores'
import { type LobbyOptions } from '@utils'
import { myPlayer } from 'playroomkit'
import { useEffect, useState } from 'react'
import { Redirect, useLocation } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'

export function Lobby() {
  const options = useLobbyOptions()
  return options ? <LobbyRoom {...options} /> : <Redirect to="/" replace />
}

function LobbyRoom({ id, username, practice, countdown }: LobbyOptions) {
  const [, navigate] = useLocation()

  const [connected, setConnected] = useState(false)

  const stage = useRoomState(s => s.stage)
  const players = useRoomState(s => s.players)

  useEffect(() => {
    connect({ roomCode: id, username, practice, countdown }).then(() => setConnected(true))
  }, [id, username, practice, countdown])

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
      {!practice && <Countdown />}
      {!practice && <Players />}
      <CameraRig />
    </>
  )
}
