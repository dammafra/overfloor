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

  useEffect(() => {
    const client = new Client(serverUrl)
    const lobbyRequest = client.joinOrCreate('lobby', { filter })

    console.log('🏟️⏳[lobby] connecting...')

    lobbyRequest.then(lobby => {
      console.log('🏟️✅[lobby] connected')

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
    })

    return () => {
      console.log('🏟️⏳[lobby] disposing...')
      lobbyRequest.then(lobby => {
        lobby.leave()
        console.log('🏟️❌[lobby] disposed')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { rooms }
}
