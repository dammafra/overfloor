import { useDebug, useGamePhase } from '@hooks'
import { hasSession } from '@multiplayer'
import { useEffect } from 'react'
import { useLocation } from 'wouter'

import { Boundaries } from './Boundaries'
import { CameraRig } from './CameraRig'
import { Countdown } from './Countdown'
import { Grid } from './Grid'
import { Leaderboard } from './Leaderboard'
import { LocalPlayer } from './LocalPlayer'
import { RemotePlayers } from './RemotePlayers'

export function Game() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  const ended = useGamePhase() === 'ended'

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
      {!ended && <LocalPlayer />}
      {!ended && <RemotePlayers />}
      {ended && <Leaderboard />}
      <CameraRig />
      {debug && <Boundaries />}
    </>
  )
}
