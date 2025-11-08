import { useColyseus, useDebug } from '@hooks'
import type { GameState } from '@schema'
import { getStateCallbacks, type SeatReservation } from 'colyseus.js'
import { useEffect } from 'react'
import { useLocation, useParams } from 'wouter'

import { useGame } from '@stores'
import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Grid } from './Grid'
import { Leaderboard } from './Leaderboard'
import { LocalPlayer } from './LocalPlayer'
import { RemotePlayers } from './RemotePlayers'

export function Game() {
  const debug = useDebug()
  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))
  const [, navigate] = useLocation()

  const { room, error } = useColyseus<GameState>({ roomName: 'game-room', reservation })

  const start = useGame(s => s.start)
  const end = useGame(s => s.end)
  const ended = useGame(s => s.phase === 'ended')

  const incrementPlayersCount = useGame(s => s.incrementPlayersCount)
  const decrementPlayersCount = useGame(s => s.decrementPlayersCount)
  const setTime = useGame(s => s.setTime)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('countdown', countdown => countdown < 0 && start())
    room.onMessage('end', end)

    $(room.state).players.onAdd(incrementPlayersCount)
    $(room.state).players.onRemove(decrementPlayersCount)
    $(room.state).listen('time', setTime)
  }, [room, start, end, incrementPlayersCount, decrementPlayersCount, setTime])

  useEffect(() => {
    if (!error) return
    navigate('/')
  }, [error, navigate])

  useEffect(() => {
    if (!room) return
    const handleVisibilityChange = () => navigate('/')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [room, navigate])

  return (
    <>
      <Countdown room={room} />
      <Grid room={room} />
      {!ended && <LocalPlayer room={room} />}
      {!ended && <RemotePlayers room={room} />}
      {ended && <Leaderboard room={room} />}
      <CameraRig room={room} />
      {debug && <Boundaries room={room} />}
    </>
  )
}
