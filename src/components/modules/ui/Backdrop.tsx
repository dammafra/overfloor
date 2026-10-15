import { a, useSpring } from '@react-spring/three'
import { useModalRoute } from '@hooks'
import { MathUtils } from 'three'

export function Backdrop() {
  const match = useModalRoute()

  const { opacity } = useSpring({ opacity: match ? 0.8 : 0 })

  return (
    <mesh renderOrder={2} rotation-x={MathUtils.degToRad(-90)} scale={100} position-y={2}>
      <planeGeometry />
      <a.meshBasicMaterial color="black" transparent opacity={opacity} />
    </mesh>
  )
}
