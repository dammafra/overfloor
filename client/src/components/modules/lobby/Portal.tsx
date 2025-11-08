import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type ThreeElement } from '@react-three/fiber'
import portalFragmentShader from '@shaders/portal/fragment.glsl'
import portalVertexShader from '@shaders/portal/vertex.glsl'
import { useRef } from 'react'
import { BackSide, Color, MathUtils, Mesh } from 'three'

const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new Color('#ffffff'),
    uColorEnd: new Color('#24acf0'),
  },
  portalVertexShader,
  portalFragmentShader,
)

extend({ PortalMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    portalMaterial: ThreeElement<typeof PortalMaterial>
  }
}

export function Portal() {
  const portalMaterialRef = useRef<ThreeElement<typeof PortalMaterial>>(null)
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!portalMaterialRef.current) return
    portalMaterialRef.current.uTime! += delta

    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.5
  })

  return (
    <mesh ref={meshRef} rotation-x={MathUtils.degToRad(-90)} scale={[5, 100, 5]}>
      <cylinderGeometry />
      <portalMaterial ref={portalMaterialRef} side={BackSide} />
    </mesh>
  )
}
