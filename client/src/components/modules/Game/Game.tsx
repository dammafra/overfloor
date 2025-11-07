import { useColyseus, useDebug } from '@hooks'
import type { GameState } from '@schema'
import { type SeatReservation } from 'colyseus.js'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useLocation, useParams } from 'wouter'

import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Grid } from './Grid'
import { LeaveButton } from './LeaveButton'
import { LocalPlayer } from './LocalPlayer'
import { RemotePlayers } from './RemotePlayers'

export function Game() {
  const debug = useDebug()
  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))
  const [, navigate] = useLocation()

  const { room, error } = useColyseus<GameState>({ roomName: 'game-room', reservation })

  useEffect(() => {
    if (!room) return

    // TODO
    room.onMessage('end', () => {
      toast.info('GAME OVER')
      navigate('/')
    })
  }, [room, navigate])

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
    navigate('/')
  }, [error, navigate])

  return (
    <>
      <LocalPlayer room={room} />
      <RemotePlayers room={room} />
      <Grid room={room} />
      <Countdown room={room} />
      <LeaveButton />
      <CameraRig room={room} />
      {debug && <Boundaries room={room} />}
    </>
  )
}
