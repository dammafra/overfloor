import { Environment } from '@components'
import { ButtonTile, TileLabel } from '@components/modules/tiles'
import { useIsTouch, useSpin } from '@hooks'
import { requestStart, useIsHost } from '@multiplayer'
import { useSpring } from '@react-spring/three'
import { Hud, PerspectiveCamera } from '@react-three/drei'
import { useRoomState } from '@stores'
import { COLORS } from '@utils'
import { MathUtils } from 'three'

const LABEL_ROTATION: [number, number, number] = [
  MathUtils.degToRad(-90),
  0,
  MathUtils.degToRad(-45),
]

export function Countdown() {
  const isTouch = useIsTouch()

  const lobby = useRoomState(s => s.lobby)
  // players joining or coming back while a match is running wait for it to end
  const playing = useRoomState(s => s.stage === 'game')
  const canStart = !!lobby?.canStart
  const countdown = lobby?.countdown
  const isOwner = useIsHost()

  const { scale, color } = useSpring({
    from: { scale: 0 },
    to: { scale: 1.5, color: canStart && isOwner ? COLORS.go : COLORS.tile },
  })

  const [rotationZ, spin] = useSpin(0, -1)

  return (
    <Hud renderPriority={2}>
      <Environment />
      <PerspectiveCamera makeDefault position={[0, 0, 7]} />
      <ButtonTile
        scale={scale}
        color={color}
        rotation={[MathUtils.degToRad(90), MathUtils.degToRad(45), 0]}
        rotation-z={rotationZ}
        onClick={() => {
          if (isOwner && canStart) requestStart()
          else spin()
        }}
      >
        {canStart ? (
          <>
            <TileLabel fontSize={0.4} rotation={LABEL_ROTATION}>
              {countdown}
            </TileLabel>
            {isOwner && (
              <TileLabel
                fontSize={0.1}
                maxWidth={0.8}
                anchorY={-0.45}
                rotation={LABEL_ROTATION}
                rotation-z={0}
              >
                {isTouch ? 'Tap' : 'Click'} to start
              </TileLabel>
            )}
          </>
        ) : (
          <TileLabel fontSize={0.13} maxWidth={1} rotation={LABEL_ROTATION}>
            {playing ? 'Match in progress' : 'Waiting for opponents'}
          </TileLabel>
        )}
      </ButtonTile>
    </Hud>
  )
}
