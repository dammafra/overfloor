import { useEnteringSmoothTime, useLobbyOptions } from '@hooks'
import { useLobbyPlayers } from '@multiplayer'
import type { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { aspects, positions } from '@utils'
import { useEffect } from 'react'
import { MathUtils } from 'three'

export function CameraRig() {
  const { controls, viewport } = useThree()
  const playersCount = useLobbyPlayers().length

  // from the menu slower, the tiles spreading along, but not to practice, straight to the game;
  // then quick, as the players join
  const options = useLobbyOptions()
  const setSmoothTime = useEnteringSmoothTime(!options?.practice && !options?.rematch)

  useEffect(() => {
    const cameraControls = controls as CameraControls
    if (!cameraControls) return

    setSmoothTime(cameraControls)

    // TODO*: find a better way to implement CameraRig, I don't like using `aspects` utils
    const [, , z] = positions.lobby.player(playersCount)
    cameraControls.rotateAzimuthTo(0, true)
    cameraControls.rotatePolarTo(MathUtils.degToRad(90), true)
    cameraControls.dollyTo(z + aspects.lobby.camera.distance(viewport.aspect), true)
  }, [playersCount, controls, viewport, setSmoothTime])

  return null
}
