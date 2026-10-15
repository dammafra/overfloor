import { a, useSpring } from '@react-spring/three'
import { Text, useCursor, type TextProps } from '@react-three/drei'
import { useState } from 'react'
import { MathUtils } from 'three'
import { Tile, type TileProps } from './Tile'

export type ButtonTileProps = TileProps & {
  disabled?: boolean
  labelProps?: Partial<TextProps>
}

export const ButtonTile = a(
  ({ disabled, children, labelProps, onClick, ...props }: ButtonTileProps) => {
    const [hovered, setHovered] = useState(false)
    useCursor(hovered)

    const baseScale = (props.scale as number) ?? 1
    const spring = useSpring({
      scale: hovered ? baseScale + 0.1 : baseScale,
    })

    return (
      <Tile
        {...props}
        scale={spring.scale}
        onPointerOver={e => {
          if (disabled) return
          setHovered(true)
          e.stopPropagation()
        }}
        onPointerOut={e => {
          if (disabled) return
          setHovered(false)
          e.stopPropagation()
        }}
        onClick={e => {
          if (disabled) return
          if (typeof onClick === 'function') onClick(e)
          e.stopPropagation()
        }}
      >
        {typeof children === 'string' ? (
          <Text
            font="/fonts/audiowide.ttf"
            textAlign="center"
            anchorY="middle"
            maxWidth={0.1}
            lineHeight={0.9}
            fontSize={0.2}
            position-y={[0.13]}
            outlineWidth={0.01}
            rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
            {...labelProps}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Tile>
    )
  },
)
