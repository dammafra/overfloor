import { Controller, Floor, LocalPlayer, RemotePlayer } from '@components'
import { useColyseus, useThrottle } from '@hooks'
import type { GameState, PlayerState } from '@server/schema'
import type { SeatReservation } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Vector3, type Quaternion, type QuaternionTuple, type Vector3Tuple } from 'three'
import { useLocation, useParams } from 'wouter'

export function World() {
  const params = useParams()
  const [, navigate] = useLocation()

  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))

  const { room, state, error } = useColyseus<GameState>({
    roomName: 'game-room',
    reservation,
  })

  const [localPlayer, setLocalPlayer] = useState<PlayerState>()
  const [remotePlayers, setRemotePlayers] = useState<PlayerState[]>([])

  useEffect(() => {
    if (!state || !state.players) return
    const players = Array.from(state.players.values())
    const localPlayer = players.find(p => p.sessionId === reservation.sessionId)
    const remotePlayers = players.filter(p => p.sessionId !== reservation.sessionId)
    setLocalPlayer(localPlayer)
    setRemotePlayers(remotePlayers)
  }, [state])

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
    navigate('/')
  }, [error])

  const handleMove = useThrottle((position: Vector3, rotation: Quaternion) => {
    room?.send('set-position', position.toArray())
    room?.send('set-rotation', rotation.toArray())
  }, 50)

  return (
    <>
      {localPlayer && (
        <Controller>
          <LocalPlayer
            name={localPlayer.username}
            onMove={handleMove}
            initialPosition={localPlayer.initialPosition.toArray() as Vector3Tuple}
          />
        </Controller>
      )}

      {remotePlayers.map(player => (
        <RemotePlayer
          key={player.username}
          name={player.username}
          initialPosition={player.initialPosition.toArray() as Vector3Tuple}
          position={player.position.toArray() as Vector3Tuple}
          rotation={player.rotation.toArray() as QuaternionTuple}
        />
      ))}

      <Floor unit={2} width={9} height={7} gap={0.1} />
    </>
  )
}
