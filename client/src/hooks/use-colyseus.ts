import { Schema } from '@colyseus/schema'
import type { Room, RoomAvailable, SeatReservation } from 'colyseus.js'
import { Client } from 'colyseus.js'
import { useEffect, useState } from 'react'

interface UseColyseusParams {
  serverUrl?: string
  roomName: string
  roomId?: string
  options?: Record<string, unknown>
  reservation?: SeatReservation
}

export function useColyseus<T extends Schema>({
  serverUrl = import.meta.env.VITE_COLYSEUS_URL,
  roomName,
  roomId,
  options,
  reservation,
}: UseColyseusParams) {
  const [room, setRoom] = useState<Room<T>>()
  const [state, setState] = useState<T>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const client = new Client(serverUrl)
    const roomRequest = roomId
      ? client.joinById<T>(roomId, options)
      : reservation
        ? client.consumeSeatReservation<T>(reservation)
        : client.create<T>(roomName, options)

    console.log(`🏟️⏳[${roomName}] connecting...`)

    roomRequest
      .then(room => {
        console.log(`🏟️✅[${roomName}] connected`)
        setRoom(room)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { room, state, error }
}

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
