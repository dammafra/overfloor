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
      {!ended && (
        <div className="absolute inset-x-6 top-6 flex items-center gap-4">
          <LeaveButton />
          {started && <PlayersCount />}
          {started && <Time />}
        </div>
      )}
      {ended && <Leaderboard />}
    </div>
  )
}
