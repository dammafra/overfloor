import { Canvas, Helpers } from '@components/helpers'
import { Game } from '@components/modules/game'
import { Lobby } from '@components/modules/lobby'
import { ProfileCharacter } from '@components/modules/profile'
import { UI } from '@components/modules/ui'
import { useDebug, useIsTouch } from '@hooks'
import { CameraControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { CAMERA_FOV, ROUTES } from '@utils'
import { useControls } from 'leva'
import { PCFShadowMap } from 'three'
import { Route } from 'wouter'
import { Environment } from './Environment'

export function Experience() {
  const isTouch = useIsTouch()
  const debug = useDebug()

  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { order: 1, collapsed: true },
  )

  return (
    <Canvas
      gl={{
        debug: {
          checkShaderErrors: debug,
          onShaderError: console.error,
          diagnostics: { keywords: true },
        },
      }}
      shadows={{ type: PCFShadowMap }}
      camera={{
        position: [0, 0, 0],
        fov: CAMERA_FOV,
        near: 0.1,
        far: 100,
      }}
    >
      <Environment shadows />
      <CameraControls enabled={debug && !isTouch} makeDefault />

      <Physics {...physicsControls}>
        <Route path={ROUTES.home} nest component={UI} />
        <Route path={ROUTES.profile} component={ProfileCharacter} />
        <Route path={ROUTES.lobby} component={Lobby} />
        <Route path={ROUTES.game} component={Game} />
        <Helpers />
      </Physics>

      {/* <SoundBoard /> */}
    </Canvas>
  )
}
