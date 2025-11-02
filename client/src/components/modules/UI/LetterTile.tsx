import type { MenuTileProps } from '@hooks'
import { a, useSpring } from '@react-spring/three'
import { Center, Float, Text3D, useCursor } from '@react-three/drei'
import { useState } from 'react'
import { MathUtils } from 'three'

type LetterTileProps = Omit<MenuTileProps, 'type'>

export const LetterTile = a(({ index, ...props }: LetterTileProps) => {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  useCursor(hovered)

  const { scale } = useSpring({
    scale: hovered ? 1.1 : (props.scale as number),
    config: { mass: 1, tension: 120, friction: 14 },
  })

  const { rotationX } = useSpring({
    rotationX: MathUtils.degToRad(clicked ? -90 + 180 : -90),
    onResolve: () => setClicked(false),
    config: { mass: 1, tension: 120, friction: 14 },
  })

  if (typeof index === 'undefined') return <></>

  return (
    <Float
      floatIntensity={0.5}
      speed={5}
      rotationIntensity={0}
      onPointerOver={e => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={e => {
        e.stopPropagation()
        setHovered(false)
      }}
      onClick={() => setClicked(true)}
    >
      <a.group {...props} scale={scale} rotation-x={rotationX} rotation-z={MathUtils.degToRad(-90)}>
        <Center>
          <Text3D
            font="/fonts/audiowide.json"
            bevelEnabled
            size={0.9}
            bevelSize={0.025}
            bevelThickness={0.05}
            bevelSegments={20}
          >
            {'OVERFLOOR'.at(index)}
            <a.meshStandardMaterial
              color={index < 4 ? 'brown' : 'limegreen'}
              transparent
              opacity={0.9}
              roughness={0}
            />
          </Text3D>
        </Center>
      </a.group>
    </Float>
  )
})
