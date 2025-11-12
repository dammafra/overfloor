import { useGame } from '@stores'
import { Leaderboard } from './Leaderboard'
import { LeaveButton } from './LeaveButton'
import { PlayersCount } from './PlayersCount'
import { Time } from './Time'

export function GameOverlay() {
  const started = useGame(s => s.phase === 'started')
  const ended = useGame(s => s.phase === 'ended')

  return (
    <div className="page pointer-events-none">
      {!ended && <LeaveButton />}
      {started && !ended && <PlayersCount />}
      {started && !ended && <Time />}
      {ended && <Leaderboard />}
    </div>
  )
}
