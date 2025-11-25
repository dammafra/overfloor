import { Canvas, Helpers } from '@components/helpers'
import { Game } from '@components/modules/game'
import { Lobby } from '@components/modules/lobby'
import { OfflineGrid } from '@components/modules/test'
import { UI } from '@components/modules/ui'
import { useDebug, useIsTouch } from '@hooks'
import { CameraControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
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
      gl={{ debug: { checkShaderErrors: debug, onShaderError: console.error } }}
      shadows
      camera={{
        position: [0, 0, 0],
        fov: 45,
        near: 0.1,
        far: 100,
      }}
    >
      <Environment shadows />
      <CameraControls enabled={debug && !isTouch} makeDefault />

      <Physics {...physicsControls}>
        <Route path="/" nest component={UI} />
        <Route path="/:from/lobby/:options" component={Lobby} />
        <Route path="/game/:reservation" component={Game} />
        <Route path="/test/offline" component={OfflineGrid} />
        <Helpers />
      </Physics>

      {/* <SoundBoard /> */}
    </Canvas>
  )
}
