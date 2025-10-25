import { Environment } from '@components'
import { Canvas, Helpers } from '@components/helpers'
import { useDebug, useIsTouch } from '@hooks'
import { Game } from '@modules/Game'
import { Lobby } from '@modules/Lobby'
import { CameraControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { Route } from 'wouter'

export function Experience() {
  const isTouch = useIsTouch()
  const debug = useDebug()

  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { collapsed: true },
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
      <Environment />
      <CameraControls enabled={debug && !isTouch} makeDefault />

      <Physics {...physicsControls} gravity={[0, -50, 0]}>
        <Route path="/:from/lobby/:options" component={Lobby} />
        <Route path="/game/:reservation" component={Game} />
        <Helpers />
      </Physics>

      {/* <SoundBoard /> */}
    </Canvas>
  )
}
