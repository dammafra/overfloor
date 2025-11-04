import { useColyseus, useDebug } from '@hooks'
import { Html } from '@react-three/drei'
import type { GameState } from '@server/schema'
import { type SeatReservation } from 'colyseus.js'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation, useParams } from 'wouter'
import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'
import { Grid } from './Grid'
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
      <CameraRig room={room} />
      {debug && <Boundaries room={room} />}

      <Html center className="absolute inset-0" wrapperClass="fixed inset-0">
        <Link
          className="button danger w-fit whitespace-nowrap absolute left-4 bottom-4"
          to="/"
          replace
        >
          leave the room
        </Link>
      </Html>
    </>
  )
}
