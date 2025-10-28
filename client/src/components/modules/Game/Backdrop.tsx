import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type ThreeElement } from '@react-three/fiber'
import backdropFragmentShader from '@shaders/backdrop/fragment.glsl'
import backdropVertexShader from '@shaders/backdrop/vertex.glsl'
import { useRef } from 'react'
import { BackSide, Color } from 'three'

const BackdropMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new Color('dodgerblue'),
    uResolution: [1, 1],
  },
  backdropVertexShader,
  backdropFragmentShader,
)

extend({ BackdropMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    backdropMaterial: ThreeElement<typeof BackdropMaterial>
  }
}

export function Backdrop() {
  const materialRef = useRef<ThreeElement<typeof BackdropMaterial>>(null)

  useFrame((_, delta) => {
    if (!materialRef.current) return
    materialRef.current.uTime! += delta
  })

  return (
    <>
      <color args={['black']} attach="background" />

      <mesh scale={40}>
        <cylinderGeometry args={[1, 0.1, 1, 32, 1, true]} />
        <backdropMaterial ref={materialRef} side={BackSide} />
      </mesh>
    </>
  )
}
