import { Environment } from '@components'
import { ButtonTile } from '@components/modules/tiles'
import { useIsTouch } from '@hooks'
import { requestStart } from '@multiplayer'
import { useSpring } from '@react-spring/three'
import { Hud, PerspectiveCamera, Text, type TextProps } from '@react-three/drei'
import { useGame, useRoomState } from '@stores'
import { useIsHost } from 'playroomkit'
import { useEffect, useMemo, useState } from 'react'
import { MathUtils } from 'three'

export function Countdown() {
  const isTouch = useIsTouch()

  const setPhase = useGame(s => s.setPhase)
  const lobby = useRoomState(s => s.lobby)
  const canStart = !!lobby?.canStart
  const countdown = lobby?.countdown
  const isOwner = useIsHost()

  const [clicked, setClicked] = useState(0)

  const commonTextProps = useMemo<Partial<TextProps>>(
    () => ({
      font: '/fonts/audiowide.ttf',
      position: [0, 0.13, 0],
      outlineWidth: 0.01,
      textAlign: 'center',
      rotation: [MathUtils.degToRad(-90), 0, MathUtils.degToRad(-45)],
    }),
    [],
  )

  useEffect(() => {
    if (countdown !== undefined && countdown <= 10) setPhase('countdown')
  }, [countdown, setPhase])

  const { scale, color } = useSpring({
    from: { scale: 0, color: canStart && isOwner ? 'limegreen' : 'dodgerblue' },
    to: { scale: 1.5, color: canStart && isOwner ? 'limegreen' : 'dodgerblue' },
  })

  const { rotationZ } = useSpring({
    rotationZ: MathUtils.degToRad(0 - clicked * 360),
    config: { mass: 1, tension: 120, friction: 15 },
  })

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
          else setClicked(c => c + 1)
        }}
      >
        {canStart ? (
          <>
            <Text fontSize={0.4} {...commonTextProps}>
              {countdown}
            </Text>
            {isOwner && (
              <Text
                fontSize={0.1}
                maxWidth={0.8}
                anchorY={-0.45}
                {...commonTextProps}
                rotation-z={0}
              >
                {isTouch ? 'Tap' : 'Click'} to start
              </Text>
            )}
          </>
        ) : (
          <Text fontSize={0.13} maxWidth={1} {...commonTextProps}>
            Waiting for opponents
          </Text>
        )}
      </ButtonTile>
    </Hud>
  )
}
