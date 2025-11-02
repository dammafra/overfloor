import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type ThreeElement } from '@react-three/fiber'
import backgroundFragmentShader from '@shaders/background/fragment.glsl'
import backgroundVertexShader from '@shaders/background/vertex.glsl'
import { useRef } from 'react'
import { BackSide, Color } from 'three'
import { Core } from './Core'

const BackgroundMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new Color('dodgerblue'),
    uResolution: [1, 1],
  },
  backgroundVertexShader,
  backgroundFragmentShader,
)

extend({ BackgroundMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    backgroundMaterial: ThreeElement<typeof BackgroundMaterial>
  }
}

export function Background() {
  const materialRef = useRef<ThreeElement<typeof BackgroundMaterial>>(null)
  const offset = 0

  useFrame((_, delta) => {
    if (!materialRef.current) return
    materialRef.current.uTime! += delta
  })

  return (
    <>
      <color args={['black']} attach="background" />
      <group scale={100} position={[0, 0.3, 0]}>
        <mesh scale={1} position={[offset, 0, offset]}>
          <cylinderGeometry args={[1, 0.08, 1, 32, 1, true]} />
          <backgroundMaterial ref={materialRef} side={BackSide} />
        </mesh>

        <Core position={[offset, -0.5, offset]} />
      </group>
    </>
  )
}
