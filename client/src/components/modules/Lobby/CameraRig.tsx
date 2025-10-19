import type { PropsWithRoom } from '@hooks'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { GameLobbyState } from '@server/schema'
import { spiralPositionLobby } from '@utils'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { MathUtils } from 'three'

// TODO*: find a better way to implement CameraRig, I don't like importing `spiralPositionLobby`
export function CameraRig({ room }: PropsWithRoom<GameLobbyState>) {
  const { controls, viewport } = useThree()
  const [playersCount, setPlayersCount] = useState(0)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).players.onAdd(() => setPlayersCount(count => count + 1))
    $(room.state).players.onRemove(() => setPlayersCount(count => count - 1))
  }, [room])

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    const [, , z] = spiralPositionLobby(playersCount)
    cameraControls.dollyTo(z + (viewport.aspect > 1 ? 5 : 10), true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(90), true)
  }, [playersCount, controls, viewport])

  return <></>
}
