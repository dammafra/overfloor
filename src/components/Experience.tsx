import { Canvas, Helpers } from '@components/helpers'
import { Game } from '@components/modules/game'
import { Lobby } from '@components/modules/lobby'
import { UI } from '@components/modules/ui'
import { useDebug, useIsTouch } from '@hooks'
import { CameraControls, PerformanceMonitor } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { CAMERA_FOV, ROUTES } from '@utils'
import { useControls } from 'leva'
import { useState } from 'react'
import { PCFShadowMap } from 'three'
import { Route } from 'wouter'
import { Environment } from './Environment'

// sharp on high density screens, lowered while the frame rate can't keep up
const MAX_DPR = Math.min(window.devicePixelRatio, 2)
const MIN_DPR = 1

export function Experience() {
  const isTouch = useIsTouch()
  const debug = useDebug()
  const [dpr, setDpr] = useState(MAX_DPR)

  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { order: 1, collapsed: true },
  )

  return (
    <Canvas
      dpr={dpr}
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
      <PerformanceMonitor
        flipflops={3}
        onIncline={() => setDpr(MAX_DPR)}
        onDecline={() => setDpr(MIN_DPR)}
        onFallback={() => setDpr(MIN_DPR)}
      />
      <Environment shadows />
      <CameraControls enabled={debug && !isTouch} makeDefault />

      <Physics {...physicsControls}>
        <Route path={ROUTES.home} nest component={UI} />
        <Route path={ROUTES.lobby} component={Lobby} />
        <Route path={ROUTES.game} component={Game} />
        <Helpers />
      </Physics>

      {/* <SoundBoard /> */}
    </Canvas>
  )
}
