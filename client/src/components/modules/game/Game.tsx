import { useColyseus, useDebug } from '@hooks'
import type { GameState } from '@schema'
import { type SeatReservation } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'wouter'

import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Grid } from './Grid'
import { Leaderboard } from './Leaderboard'
import { LeaveButton } from './LeaveButton'
import { LocalPlayer } from './LocalPlayer'
import { PlayersCount } from './PlayersCount'
import { RemotePlayers } from './RemotePlayers'
import { Time } from './Time'

export function Game() {
  const debug = useDebug()
  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))
  const [, navigate] = useLocation()

  const { room, error } = useColyseus<GameState>({ roomName: 'game-room', reservation })
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    if (!room) return
    room.onMessage('end', () => setGameOver(true))
  }, [room, navigate])

  useEffect(() => {
    if (!error) return
    // toast.error(error.message)
    navigate('/')
  }, [error, navigate])

  return (
    <>
      <Grid room={room} />
      {!gameOver && <LocalPlayer room={room} />}
      {!gameOver && <RemotePlayers room={room} />}
      {gameOver && <Leaderboard room={room} />}

      <Countdown room={room} />
      {!gameOver && <PlayersCount room={room} />}
      {!gameOver && <Time room={room} />}
      {!gameOver && <LeaveButton />}

      <CameraRig room={room} />
      {debug && <Boundaries room={room} />}
    </>
  )
}
