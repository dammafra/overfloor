import { Schema } from '@colyseus/schema'
import type { RoomAvailable } from 'colyseus.js'
import { Client } from 'colyseus.js'
import { useEffect, useState } from 'react'

interface UseColyseusOptions {
  serverUrl?: string
  roomName: string
  roomId: string
  method?: 'create' | 'join' | 'joinById' | 'joinOrCreate' | 'reconnect'
  options?: Record<string, unknown>
}

export function useColyseus<T extends Schema>({
  serverUrl = import.meta.env.VITE_COLYSEUS_URL,
  roomName,
  roomId,
  method = 'joinOrCreate',
  options,
}: UseColyseusOptions) {
  const [state, setState] = useState<T>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const client = new Client(serverUrl)
    const roomRequest = client[method]<T>(method === 'joinById' ? roomId : roomName, options)

    console.log(`🏟️⏳[${roomName}] connecting...`)

    roomRequest
      .then(room => {
        console.log(`🏟️✅[${roomName}] connected`)
        room.onStateChange(state => setState({ ...state }))
        room.onError((code, message) => setError(new Error(`Colyseus error ${code}: ${message}`)))
      })
      .catch(setError)

    return () => {
      console.log(`🏟️⏳[${roomName}] disposing...`)
      roomRequest.then(room => {
        room.leave()
        console.log(`🏟️❌[${roomName}] disposed`)
      })
    }
  }, [])

  return { state, error }
}

export function useLobby(serverUrl: string = import.meta.env.VITE_COLYSEUS_URL) {
  const [rooms, setRooms] = useState<RoomAvailable[]>([])

  useEffect(() => {
    const client = new Client(serverUrl)
    const lobbyRequest = client.joinOrCreate('lobby')

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
  }, [serverUrl])

  return { rooms }
}
