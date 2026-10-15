import { connect } from '@multiplayer'
import { PLAYER } from '@schema'
import { useRoomState } from '@stores'
import { getRoomCode, myPlayer } from 'playroomkit'
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Players } from './Players'

export function Lobby() {
  const { from, options } = useParams()
  const { id, username, training, countdown, rematch } = JSON.parse(atob(options!))
  const [, navigate] = useLocation()

  const [connected, setConnected] = useState(false)

  const stage = useRoomState(s => s.stage)
  const players = useRoomState(s => s.players)

  useEffect(() => {
    connect({ roomCode: id, username, training, countdown }).then(() => {
      setConnected(true)

      if (from === 'new') {
        const options = btoa(JSON.stringify({ id: getRoomCode(), username, training, rematch }))
        navigate(`/join/lobby/${options}`, { replace: true })
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
