import { Client, type Room, type SeatReservation } from 'colyseus.js'
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

export function useColyseus(): Client
export function useColyseus(serverUrl: string): Client
export function useColyseus<T>(params: UseColyseusParams): { room: Room<T> | undefined, error: Error | undefined } //prettier-ignore

export function useColyseus<T>(input?: string | UseColyseusParams) {
  const [client, setClient] = useState<Client>()
  const [room, setRoom] = useState<Room<T>>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const serverUrl = (typeof input === 'object' ? input.serverUrl : input) ?? import.meta.env.VITE_COLYSEUS_URL //prettier-ignore
    const client = new Client(serverUrl)
    setClient(client)

    if (typeof input !== 'object') return

    const { roomName, roomId, reservation, options } = input

    const roomRequest = roomId
      ? client.joinById<T>(roomId, options)
      : reservation
        ? client.consumeSeatReservation<T>(reservation)
        : client.create<T>(roomName, options)

    roomRequest
      .then(room => {
        setRoom(room)
        room.onError((code, message) => setError(new Error(`Colyseus error ${code}: ${message}`)))
      })
      .catch(setError)

    return () => {
      roomRequest.then(room => room.leave())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (typeof input === 'object') return { room, error }
  return client
}
