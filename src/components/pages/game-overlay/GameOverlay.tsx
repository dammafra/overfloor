import { useGamePhase } from '@hooks'
import { Leaderboard } from './Leaderboard'
import { LeaveButton } from './LeaveButton'
import { PlayersCount } from './PlayersCount'
import { Time } from './Time'

export function GameOverlay() {
  const phase = useGamePhase()
  const started = phase === 'started'
  const ended = phase === 'ended'

  return (
    <div className="page pointer-events-none">
      {!ended && <LeaveButton />}
      {started && !ended && <PlayersCount />}
      {started && !ended && <Time />}
      {ended && <Leaderboard />}
    </div>
  )
}
