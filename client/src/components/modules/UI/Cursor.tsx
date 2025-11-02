import PointerControls from '@components/helpers/PointerControls'
import { useIsTouch } from '@hooks'

export function Cursor() {
  const touch = useIsTouch()

  return (
    !touch && (
      <PointerControls lockPositionYAt={0.25}>
        <pointLight intensity={0.1} />
      </PointerControls>
    )
  )
}
