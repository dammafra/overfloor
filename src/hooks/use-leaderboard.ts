import { PLAYER } from '@schema'
import { useRoomState } from '@stores'
import { myPlayer } from 'playroomkit'

// final ranking, winner first, and whether the local player won
export function useLeaderboard() {
  const username: string | undefined = myPlayer()?.getState(PLAYER.username)
  const ranking = useRoomState(s => s.leaderboard)
  const leaderboard = [...ranking].reverse()

  return { username, leaderboard, winner: leaderboard.at(0) === username }
}
