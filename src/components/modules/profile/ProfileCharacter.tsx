import { Player } from '@components'
import { a, useSpring } from '@react-spring/three'
import { Float } from '@react-three/drei'
import { selectProfileColor, useProfile } from '@stores'
import { MathUtils } from 'three'

// the character lying on the profile tile, facing the camera like the tile label,
// bigger in the middle of the tile once open
export function ProfileCharacter({ open }: { open: boolean }) {
  const color = useProfile(selectProfileColor)

  const spring = useSpring({
    // above the label when closed
    positionX: open ? 0 : 0.15,
    scale: open ? 0.15 : 0.28,
  })

  return (
    // undoes the diagonal of the tile, as seen by the menu camera
    <group rotation-y={MathUtils.degToRad(-45)}>
      <a.group
        position-x={spring.positionX}
        position-y={0.3}
        rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
        scale={spring.scale}
      >
        <Float floatIntensity={2} rotationIntensity={1}>
          <Player position-y={-0.4} rotation-y={-0.4} scale={1.25} color={color} />
        </Float>
      </a.group>
    </group>
  )
}
