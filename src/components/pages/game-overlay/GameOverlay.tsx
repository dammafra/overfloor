import { useGamePhase } from '@hooks'
import { Leaderboard } from './Leaderboard'
import { LeaveButton } from './LeaveButton'
import { PlayersCount } from './PlayersCount'
import { Time } from './Time'

// diamonds as in the menu grid, 36px apart (see `Profile`): leave on the left, the time on the
// right, the players count below between them
const SQUARE = {
  left: 'absolute top-0 left-0',
  right: 'absolute top-0 left-18',
  bottom: 'absolute top-9 left-9',
}

export function GameOverlay() {
  const phase = useGamePhase()
  const started = phase === 'started'
  const ended = phase === 'ended'

  return (
    <div className="page pointer-events-none">
      {!ended && (
        <div className="absolute top-6 left-6">
          <LeaveButton className={SQUARE.left} />
          {started && <Time className={SQUARE.right} />}
          {started && <PlayersCount className={SQUARE.bottom} />}
        </div>
      )}
      {ended && <Leaderboard />}
    </div>
  )
}
