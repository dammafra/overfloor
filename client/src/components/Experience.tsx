import { CameraControls } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useControls } from 'leva'
import { useDebug } from '../hooks/use-debug'
import { useIsTouch } from '../hooks/use-is-touch'
import Environment from './Environment'
import CameraRig from './helpers/CameraRig'
import Canvas from './helpers/Canvas'
import Helpers from './helpers/Helpers'
import World from './World'

export default function Experience() {
  const isTouch = useIsTouch()
  const debug = useDebug()

  const physicsControls = useControls(
    'physics',
    { debug: false, paused: false },
    { collapsed: true },
  )

  return (
    <Canvas
      className="fixed top-0 z-100"
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
        <World />
        <Helpers />
      </Physics>

      {/* <SoundBoard /> */}
      <CameraRig />
    </Canvas>
  )
}
