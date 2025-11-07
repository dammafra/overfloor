import { Helpers } from '@components/helpers'
import { Game } from '@components/modules/game'
import { Lobby } from '@components/modules/lobby'
import { UI } from '@components/modules/ui'
import { useDebug, useIsTouch } from '@hooks'
import { CameraControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
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
        fov: 45,
        near: 0.1,
        far: 100,
      }}
    >
      <Environment shadows />
      <CameraControls enabled={debug && !isTouch} makeDefault />

      <UI />

      <Physics {...physicsControls}>
        <Route path="/:from/lobby/:options" component={Lobby} />
        <Route path="/game/:reservation" component={Game} />
        <Helpers />
      </Physics>

      {/* <SoundBoard /> */}
    </Canvas>
  )
}
