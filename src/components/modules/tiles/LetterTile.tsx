import { useHover, useSpin } from '@hooks'
import { a, useSpring } from '@react-spring/three'
import { Center, Float, Text3D } from '@react-three/drei'
import { animatable, FONT_3D } from '@utils'
import { MathUtils } from 'three'
import type { TileProps } from './Tile'

export const LetterTile = animatable(({ children, color, scale, ...props }: TileProps) => {
  const [hovered, hoverHandlers] = useHover()
  const [rotationX, spin] = useSpin(-90)

  const baseScale = (scale as number) ?? 1
  const spring = useSpring({
    scale: hovered ? baseScale * 1.1 : baseScale,
  })

  return (
    <Float floatIntensity={0.5} speed={5} rotationIntensity={0} {...hoverHandlers} onClick={spin}>
      <a.group
        scale={spring.scale}
        rotation-x={rotationX}
        rotation-z={MathUtils.degToRad(-90)}
        {...props}
      >
        <Center>
          <Text3D
            font={FONT_3D}
            bevelEnabled
            size={0.9}
            bevelSize={0.025}
            bevelThickness={0.05}
            bevelSegments={5}
          >
            {children}
            <a.meshStandardMaterial color={color} transparent opacity={0.9} roughness={0} />
          </Text3D>
        </Center>
      </a.group>
    </Float>
  )
})
