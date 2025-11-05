import { useSpring } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { aspects } from '@utils'
import { useEffect } from 'react'
import { MathUtils, type ColorRepresentation, type Vector3Tuple } from 'three'
import { useLocation } from 'wouter'
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
  const [, navigate] = useLocation()

  const spring = useSpring({
    position: (open
      ? aspects.ui.tile.button.position(viewport.aspect)
      : props.position) as Vector3Tuple,
    rotationX: MathUtils.degToRad(open ? 360 : 0),
    color: (open ? openColor : color) as string,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      navigate('/')
      e.stopPropagation()
    }
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [open, navigate])

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
