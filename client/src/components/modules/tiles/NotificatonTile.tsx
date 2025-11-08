import { useTransition } from '@react-spring/three'
import { Billboard, ScreenSpace } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { MathUtils, type Vector3Tuple } from 'three'
import { Tile, type TileProps } from './Tile'

interface NotificationTileProps extends TileProps {
  open?: boolean
}

export function NotificationTile({ open, ...props }: NotificationTileProps) {
  const { viewport } = useThree()

  const transition = useTransition(open, {
    from: {
      scale: 0,
      position: [-10, viewport.height * 0.5 - 1, viewport.distance - 3] as Vector3Tuple,
    },
    enter: {
      scale: 1,
      position: [-viewport.width * 0.5 + 1.5, viewport.height * 0.5 -1, viewport.distance - 3] as Vector3Tuple, //prettier-ignore
    },
    leave: {
      scale: 0,
      position: [-10, viewport.height * 0.5 - 1, viewport.distance - 3] as Vector3Tuple,
    },
    update: {
      position: [-viewport.width * 0.5 + 1.5, viewport.height * 0.5 -1, viewport.distance - 3] as Vector3Tuple, //prettier-ignore
    },
  })

  return transition(
    (spring, open) =>
      open && (
        <ScreenSpace>
          <Billboard>
            <Tile
              {...props}
              {...spring}
              rotation={[MathUtils.degToRad(90), MathUtils.degToRad(0), 0]}
            />
          </Billboard>
        </ScreenSpace>
      ),
  )
}
