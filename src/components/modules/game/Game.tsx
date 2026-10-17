import { useDebug, useGamePhase } from '@hooks'
import { hasSession } from '@multiplayer'
import { useRoomState } from '@stores'
import { myPlayer } from 'playroomkit'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'
import { Controller } from './Controller'
import { Countdown } from './Countdown'
import { GATHER_DURATION, Grid } from './Grid'
import { Leaderboard } from './Leaderboard'
import { Players } from './Players'

export function Game() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  const ended = useGamePhase() === 'ended'
  const inMatch = useRoomState(s => s.players.some(p => p.id === myPlayer()?.id))

  // the players drop on the grid once gathered, not on its invisible bodies
  const [gathered, setGathered] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => setGathered(true), GATHER_DURATION)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!hasSession()) navigate('/', { replace: true })
  }, [navigate])

  useEffect(() => {
    const handleVisibilityChange = () => navigate('/')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [navigate])

  return (
    <>
      <Countdown />
      <Grid />
      {!ended && gathered && <Players />}
      {!ended && inMatch && <Controller />}
      {ended && <Leaderboard />}
      <CameraRig />
      {debug && <Boundaries />}
    </>
  )
}
