import type { PropsWithRoom } from '@hooks'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { GameLobbyState } from '@schema'
import { aspects, positions } from '@utils'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'
import { MathUtils } from 'three'

// TODO*: find a better way to implement CameraRig, I don't like using `aspects` utils
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

    const [, , z] = positions.lobby.player(playersCount)
    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(90), true)
    cameraControls.dollyTo(z + aspects.lobby.camera.distance(viewport.aspect), true)
  }, [playersCount, controls, viewport])

  return <></>
}
