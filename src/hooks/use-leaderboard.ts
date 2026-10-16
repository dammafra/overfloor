import { playerProfile } from '@multiplayer'
import { useRoomState } from '@stores'
import { myPlayer } from 'playroomkit'

// final ranking, winner first, and the local player: its color and whether it won
export function useLeaderboard() {
  const me = myPlayer()
  const { username, color } = me ? playerProfile(me) : {}
  const ranking = useRoomState(s => s.leaderboard)
  const leaderboard = [...ranking].reverse()

  return { username, color, leaderboard, winner: leaderboard.at(0) === username }
}
