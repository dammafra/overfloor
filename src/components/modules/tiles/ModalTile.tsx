import { useEscape } from '@hooks'
import { useSpring } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { aspects, COLORS } from '@utils'
import { MathUtils, type ColorRepresentation, type Vector3Tuple } from 'three'
import { ButtonTile, type ButtonTileProps } from './ButtonTile'

interface ModalTileProps extends ButtonTileProps {
  open?: boolean
  openColor?: ColorRepresentation
  // page to go back to on Escape
  closeTo?: string
}

export function ModalTile({
  open,
  labelProps,
  color = COLORS.tile,
  openColor = COLORS.tile,
  closeTo = '/',
  ...props
}: ModalTileProps) {
  const { viewport, size } = useThree()

  const spring = useSpring({
    position: (open
      ? aspects.ui.tile.button.position(viewport.aspect, size.height)
      : props.position) as Vector3Tuple,
    rotationX: MathUtils.degToRad(open ? 360 : 0),
    color: (open ? openColor : color) as string,
  })

  // only the open modal closes on Escape
  useEscape(closeTo, open)

  return (
    <ButtonTile
      {...props}
      disabled={open}
      position={spring.position}
      rotation-x={spring.rotationX}
      color={spring.color}
      labelProps={{ visible: !open, ...labelProps }}
    />
  )
}
