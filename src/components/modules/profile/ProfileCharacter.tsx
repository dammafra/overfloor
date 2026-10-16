import { Environment, Player } from '@components'
import { a, useSpring } from '@react-spring/three'
import { Float, Hud, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { selectProfileColor, useProfile } from '@stores'

// pixel height of the character box of the profile page (`h-80 short:h-40`)
function boxHeight({ width, height }: { width: number; height: number }) {
  const short = width > height && height <= 512
  return short ? 160 : 320
}

// the character of the profile page, as big as its box and centered like it
export function ProfileCharacter() {
  const { size } = useThree()
  const color = useProfile(selectProfileColor)

  const spring = useSpring({
    from: { scale: 0 },
    to: { scale: boxHeight(size) / size.height },
  })

  return (
    <Hud>
      <Environment />
      <PerspectiveCamera makeDefault position={[0, 0, 3.5]} fov={45} />

      <a.group scale={spring.scale}>
        <Float floatIntensity={2} rotationIntensity={1}>
          <Player position-y={-0.4} rotation-y={-0.4} scale={1.25} color={color} />
        </Float>
      </a.group>
    </Hud>
  )
}
