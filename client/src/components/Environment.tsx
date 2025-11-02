import { Helper, SoftShadows } from '@react-three/drei'
import { useControls } from 'leva'
import { CameraHelper } from 'three'

export function Environment() {
  const { helpers, ambientLightIntensity, directionalLightIntensity, directionalLightPosition } =
    useControls(
      'environment',
      {
        helpers: false,
        ambientLightIntensity: {
          value: 1.5,
          min: 0,
          max: 20,
          step: 0.01,
          label: 'ambient intensity',
        },
        directionalLightIntensity: {
          value: 3.5,
          min: 0,
          max: 20,
          step: 0.01,
          label: 'directional intensity',
        },
        directionalLightPosition: {
          value: [2, 4, 4],
          min: 0,
          max: 20,
          step: 0.01,
          label: 'directional position',
        },
      },
      { collapsed: true },
    )

  return (
    <>
      <directionalLight
        castShadow
        position={directionalLightPosition}
        intensity={directionalLightIntensity}
        shadow-mapSize={[512, 512]}
      >
        <orthographicCamera
          attach="shadow-camera"
          near={-10}
          far={20}
          top={20}
          right={20}
          bottom={-20}
          left={-20}
        >
          {helpers && <Helper type={CameraHelper} />}
        </orthographicCamera>
      </directionalLight>

      <ambientLight intensity={ambientLightIntensity} />

      <SoftShadows size={10} />
    </>
  )
}
