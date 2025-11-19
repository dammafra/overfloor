import { Client, type Room, type SeatReservation } from 'colyseus.js'
import { useEffect, useState } from 'react'

interface ColyseusErrorOptions {
  code?: number
  notify?: boolean
}

class ColyseusError extends Error {
  code?: number
  notify?: boolean

  constructor(message?: string, options?: ColyseusErrorOptions) {
    super(message)

    this.code = options?.code
    this.notify = options?.notify
  }
}

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

export function useRoom(): Client
export function useRoom(serverUrl: string): Client
export function useRoom<T>(params: UseColyseusParams): { room: Room<T> | undefined, error: ColyseusError | undefined } //prettier-ignore

export function useRoom<T>(input?: string | UseColyseusParams) {
  const [client, setClient] = useState<Client>()
  const [room, setRoom] = useState<Room<T>>()
  const [error, setError] = useState<ColyseusError>()

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

    let livenessProbe: number
    roomRequest
      .then(room => {
        setRoom(room)
        room.onError((code, message) => setError(new ColyseusError(message, { code })))
        livenessProbe = window.setInterval(() => {
          if (!room.connection.isOpen)
            setError(new ColyseusError('Connection lost', { notify: true }))
        }, 1000)
      })
      .catch(setError)

    return () => {
      roomRequest.then(room => room.leave())
      clearInterval(livenessProbe)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (typeof input === 'object') return { room, error }
  return client
}
