import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, type ThreeElement } from '@react-three/fiber'
import backgroundFragmentShader from '@shaders/background/fragment.glsl'
import backgroundVertexShader from '@shaders/background/vertex.glsl'
import portalFragmentShader from '@shaders/portal/fragment.glsl'
import portalVertexShader from '@shaders/portal/vertex.glsl'
import { useRef, type JSX } from 'react'
import { BackSide, Color, Mesh } from 'three'

const CoreMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new Color('#ffffff'),
    uColorEnd: new Color('#24acf0'),
  },
  portalVertexShader,
  portalFragmentShader,
)
const BackgroundMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new Color('dodgerblue'),
    uResolution: [1, 1],
  },
  backgroundVertexShader,
  backgroundFragmentShader,
)

extend({ CoreMaterial, BackgroundMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    coreMaterial: ThreeElement<typeof CoreMaterial>
    backgroundMaterial: ThreeElement<typeof BackgroundMaterial>
  }
}

function Core(props: JSX.IntrinsicElements['mesh']) {
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
