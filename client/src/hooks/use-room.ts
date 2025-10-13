import { Schema } from '@colyseus/schema'
import type { Room, SeatReservation } from 'colyseus.js'
import { Client } from 'colyseus.js'
import { useEffect, useState } from 'react'

export interface PropsWithRoom<T> {
  room?: Room<T>
}

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

  return { room, error }
}
