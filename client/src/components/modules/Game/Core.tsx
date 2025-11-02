import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type ThreeElement } from '@react-three/fiber'
import portalFragmentShader from '@shaders/portal/fragment.glsl'
import portalVertexShader from '@shaders/portal/vertex.glsl'
import { useRef, type JSX } from 'react'
import { Color, Mesh } from 'three'

const CoreMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new Color('#ffffff'),
    uColorEnd: new Color('#24acf0'),
  },
  portalVertexShader,
  portalFragmentShader,
)

extend({ CoreMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    coreMaterial: ThreeElement<typeof CoreMaterial>
  }
}

export function Core(props: JSX.IntrinsicElements['mesh']) {
  const coreMaterialRef = useRef<ThreeElement<typeof CoreMaterial>>(null)
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!coreMaterialRef.current) return
    coreMaterialRef.current.uTime! += delta

    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.5
  })

  return (
    <mesh scale={0.1} {...props}>
      <icosahedronGeometry args={[1, 2]} />
      <coreMaterial ref={coreMaterialRef} />
    </mesh>
  )
}
