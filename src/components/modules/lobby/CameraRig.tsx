import { useLobbyPlayers } from '@multiplayer'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { aspects, positions } from '@utils'
import { useEffect } from 'react'
import { MathUtils } from 'three'

export function CameraRig() {
  const { controls, viewport } = useThree()
  const playersCount = useLobbyPlayers().length

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    // TODO*: find a better way to implement CameraRig, I don't like using `aspects` utils
    const [, , z] = positions.lobby.player(playersCount)
    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(90), true)
    cameraControls.dollyTo(z + aspects.lobby.camera.distance(viewport.aspect), true)
  }, [playersCount, controls, viewport])

  return <></>
}
