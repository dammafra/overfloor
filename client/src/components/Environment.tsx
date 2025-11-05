import { Helper, SoftShadows } from '@react-three/drei'
import { useControls } from 'leva'
import { CameraHelper } from 'three'

interface EnvironmentProps {
  shadows?: boolean
}

export function Environment({ shadows }: EnvironmentProps) {
  const { helpers, ambientLightIntensity, directionalLightIntensity, directionalLightPosition } =
    useControls(
      'environment',
      {
        helpers: false,
        ambientLightIntensity: {
          value: 0.5,
          min: 0,
          max: 20,
          step: 0.01,
          label: 'ambient intensity',
        },
        directionalLightIntensity: {
          value: 3,
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
        shadow-mapSize={shadows && [512, 512]}
      >
        {shadows && (
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
        )}
      </directionalLight>

      <ambientLight intensity={ambientLightIntensity} />

      {shadows && <SoftShadows size={10} focus={1} />}
    </>
  )
}
