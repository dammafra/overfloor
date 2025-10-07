import { Schema } from '@colyseus/schema'
import type { RoomAvailable } from 'colyseus.js'
import { Client } from 'colyseus.js'
import { useEffect, useState } from 'react'

const client = new Client(import.meta.env.VITE_COLYSEUS_URL)

interface UseColyseusOptions {
  roomName: string
  method?: 'create' | 'join' | 'joinById' | 'joinOrCreate' | 'reconnect'
  options?: Record<string, unknown>
}

export function useColyseus<T extends Schema>({
  roomName,
  method = 'joinOrCreate',
  options = {},
}: UseColyseusOptions) {
  const [state, setState] = useState<T>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const roomRequest = client[method]<T>(roomName, options)

    console.log('connecting...')

    roomRequest
      .then(room => {
        console.log('connected')
        setState(room.state)
        room.onStateChange(state => setState({ ...state }))
        room.onError((code, message) => setError(new Error(`Colyseus error ${code}: ${message}`)))
      })
      .catch(setError)

    return () => {
      console.log('disposing...')
      roomRequest.then(room => {
        room.leave()
        console.log('disposed')
      })
    }
  }, [])

  return { state, error }
}

export function useLobby() {
  const [rooms, setRooms] = useState<RoomAvailable[]>([])

  useEffect(() => {
    const lobbyRequest = client.joinOrCreate('lobby')

    lobbyRequest.then(lobby => {
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
      lobbyRequest.then(lobby => lobby.leave())
    }
  }, [])

  return { rooms }
}
