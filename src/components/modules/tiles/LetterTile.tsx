import { a, useSpring } from '@react-spring/three'
import { Center, Float, Text3D, useCursor } from '@react-three/drei'
import { useState } from 'react'
import { MathUtils } from 'three'
import type { TileProps } from './Tile'

export const LetterTile = a(({ children, color, ...props }: TileProps) => {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(0)
  useCursor(hovered)

  const { scale } = useSpring({
    scale: hovered ? 1.1 : (props.scale as number),
  })

  const { rotationX } = useSpring({
    rotationX: MathUtils.degToRad(-90 + clicked * 360),
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return (
    <Float
      floatIntensity={0.5}
      speed={5}
      rotationIntensity={0}
      onPointerOver={e => {
        setHovered(true)
        e.stopPropagation()
      }}
      onPointerOut={e => {
        setHovered(false)
        e.stopPropagation()
      }}
      onClick={() => setClicked(c => c + 1)}
    >
      <a.group scale={scale} rotation-x={rotationX} rotation-z={MathUtils.degToRad(-90)} {...props}>
        <Center>
          <Text3D
            font="/fonts/audiowide.json"
            bevelEnabled
            size={0.9}
            bevelSize={0.025}
            bevelThickness={0.05}
            bevelSegments={20}
          >
            {children}
            <a.meshStandardMaterial color={color} transparent opacity={0.9} roughness={0} />
          </Text3D>
        </Center>
      </a.group>
    </Float>
  )
})
