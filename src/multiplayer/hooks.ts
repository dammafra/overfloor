import { PLAYER } from '@schema'
import { usePlayersState } from 'playroomkit'
import { useMemo } from 'react'

// usernames of the players waiting in the lobby, latest first
export function useLobbyPlayers() {
  const players = usePlayersState(PLAYER.inLobby)

  return useMemo(
    () =>
      players
        .filter(({ state }) => state)
        .map(({ player }) => player.getState(PLAYER.username) as string | undefined)
        .filter(username => !!username)
        .reverse() as string[],
    [players],
  )
}
