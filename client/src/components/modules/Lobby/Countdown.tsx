import { ButtonTile } from '@components/ButtonTile'
import { Environment } from '@components/Environment'
import { useIsTouch, type PropsWithRoom } from '@hooks'
import { useSpring } from '@react-spring/three'
import { Hud, PerspectiveCamera, Text, type TextProps } from '@react-three/drei'
import type { GameLobbyState } from '@server/schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useMemo, useState } from 'react'
import { MathUtils } from 'three'
import { useParams } from 'wouter'

export function Countdown({ room }: PropsWithRoom<GameLobbyState>) {
  const { options } = useParams()
  const { username } = JSON.parse(atob(options!))
  const isTouch = useIsTouch()

  const [canStart, setCanStart] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [isOwner, setIsOwner] = useState(false)

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
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('owner', owner => setIsOwner(owner === username))
    $(room.state).listen('canStart', setCanStart)
    $(room.state).listen('countdown', countdown => setCountdown(countdown.toString()))
  }, [room, username])

  const { scale, color } = useSpring({
    from: { scale: 0, color: canStart && isOwner ? 'green' : 'dodgerblue' },
    to: { scale: 1.5, color: canStart && isOwner ? 'green' : 'dodgerblue' },
  })

  return (
    <Hud renderPriority={2}>
      <Environment />
      <PerspectiveCamera makeDefault position={[0, 0, 7]} />
      <ButtonTile
        scale={scale}
        color={color}
        disabled={!isOwner || !canStart}
        rotation={[MathUtils.degToRad(90), MathUtils.degToRad(45), 0]}
        onClick={() => room?.send('start')}
      >
        {canStart ? (
          <>
            <Text fontSize={0.4} {...commonTextProps}>
              {countdown}
            </Text>
            {isOwner && (
              <Text fontSize={0.1} maxWidth={0.5} anchorY={0.2} {...commonTextProps}>
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
