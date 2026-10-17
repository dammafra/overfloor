import { useHover } from '@hooks'
import { useSpring } from '@react-spring/three'
import type { TextProps } from '@react-three/drei'
import { animatable, ICON_FONT } from '@utils'
import { Tile, type TileProps } from './Tile'
import { TileLabel } from './TileLabel'

export type ButtonTileProps = TileProps & {
  disabled?: boolean
  labelProps?: Partial<TextProps>
  // codepoint of a Material Icon (see `ICONS`), above the label
  icon?: string
}

// along the text up direction, the icon above and the label below
const ICON_OFFSET = { icon: 0.14, label: -0.17 }

export const ButtonTile = animatable(
  ({ disabled, children, labelProps, icon, onClick, ...props }: ButtonTileProps) => {
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
        {icon && (
          <TileLabel
            font={ICON_FONT}
            anchorY="middle"
            fontSize={0.35}
            position={[ICON_OFFSET.icon, 0.13, 0]}
            visible={labelProps?.visible}
          >
            {icon}
          </TileLabel>
        )}
        {typeof children === 'string' ? (
          <TileLabel
            anchorY="middle"
            maxWidth={0.1}
            lineHeight={0.9}
            fontSize={0.2}
            {...(icon && { position: [ICON_OFFSET.label, 0.13, 0] })}
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
