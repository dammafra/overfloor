import { useSpring } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { aspects } from '@utils'
import { MathUtils, type ColorRepresentation, type Vector3Tuple } from 'three'
import { ButtonTile, type ButtonTileProps } from './ButtonTile'

interface ModalTileProps extends ButtonTileProps {
  open?: boolean
  openColor?: ColorRepresentation
}

export function ModalTile({
  open,
  labelProps,
  color = 'dodgerblue',
  openColor = 'dodgerblue',
  ...props
}: ModalTileProps) {
  const { viewport } = useThree()

  const spring = useSpring({
    position: (open
      ? aspects.ui.tile.button.position(viewport.aspect)
      : props.position) as Vector3Tuple,
    rotationX: MathUtils.degToRad(open ? 360 : 0),
    color: (open ? openColor : color) as string,
  })

  return (
    <ButtonTile
      {...props}
      position={spring.position}
      rotation-x={spring.rotationX}
      color={spring.color}
      labelProps={{ visible: !open, ...labelProps }}
    />
  )
}
