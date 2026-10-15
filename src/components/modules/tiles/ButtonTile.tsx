import { useHover } from '@hooks'
import { useSpring } from '@react-spring/three'
import type { TextProps } from '@react-three/drei'
import { animatable } from '@utils'
import { Tile, type TileProps } from './Tile'
import { TileLabel } from './TileLabel'

export type ButtonTileProps = TileProps & {
  disabled?: boolean
  labelProps?: Partial<TextProps>
}

export const ButtonTile = animatable(
  ({ disabled, children, labelProps, onClick, ...props }: ButtonTileProps) => {
    const [hovered, hoverHandlers] = useHover(disabled)

    const baseScale = (props.scale as number) ?? 1
    const spring = useSpring({
      scale: hovered ? baseScale * 1.1 : baseScale,
    })

    return (
      <Tile
        {...props}
        {...hoverHandlers}
        scale={spring.scale}
        onClick={e => {
          if (disabled) return
          if (typeof onClick === 'function') onClick(e)
          e.stopPropagation()
        }}
      >
        {typeof children === 'string' ? (
          <TileLabel
            anchorY="middle"
            maxWidth={0.1}
            lineHeight={0.9}
            fontSize={0.2}
            {...labelProps}
          >
            {children}
          </TileLabel>
        ) : (
          children
        )}
      </Tile>
    )
  },
)
