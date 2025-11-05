import { a, useSpring } from '@react-spring/three'
import { MathUtils } from 'three'
import { useLocation, useRoute } from 'wouter'

export function Backdrop() {
  const [, navigate] = useLocation()

  const [matchNew] = useRoute('/new')
  const [matchJoin] = useRoute('/join/:id?')
  const [matchCredits] = useRoute('/credits')
  const match = matchNew || matchJoin || matchCredits

  const { opacity } = useSpring({ opacity: match ? 0.8 : 0 })

  return (
    <mesh
      onClick={e => {
        if (!match) return
        navigate('/')
        e.stopPropagation()
      }}
      onPointerOver={e => e.stopPropagation()}
      renderOrder={2}
      rotation-x={MathUtils.degToRad(-90)}
      scale={100}
      position-y={2}
    >
      <planeGeometry />
      <a.meshBasicMaterial color="black" transparent opacity={opacity} />
    </mesh>
  )
}
