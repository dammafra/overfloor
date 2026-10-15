import type { RoomAvailable } from 'colyseus.js'
import { Client } from 'colyseus.js'
import { useEffect, useState } from 'react'

interface UseLobbyParams {
  serverUrl?: string
  filter?: Record<string, unknown>
}

export function useLobby({
  serverUrl = import.meta.env.VITE_COLYSEUS_URL,
  filter,
}: UseLobbyParams) {
  const [rooms, setRooms] = useState<RoomAvailable[]>([])
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const client = new Client(serverUrl)
    const lobbyRequest = client.joinOrCreate('lobby', { filter })

    lobbyRequest
      .then(lobby => {
        lobby.onMessage('rooms', setRooms)

        lobby.onMessage('+', ([roomId, room]) =>
          setRooms(rooms =>
            rooms.some(r => r.roomId === roomId)
              ? rooms.map(r => (r.roomId === roomId ? room : r))
              : [...rooms, room],
          ),
        )

        lobby.onMessage('-', roomId =>
          setRooms(rooms => rooms.filter(room => room.roomId !== roomId)),
        )

        lobby.onError((code, message) => setError(new Error(`Colyseus error ${code}: ${message}`)))
      })
      .catch(setError)
      .finally(() => setLoading(false))

    return () => {
      lobbyRequest.then(lobby => lobby.leave())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { rooms, error, loading }
}
