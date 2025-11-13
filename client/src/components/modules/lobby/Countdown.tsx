import { Environment } from '@components'
import { ButtonTile } from '@components/modules/tiles'
import { useIsTouch, type PropsWithRoom } from '@hooks'
import { useSpring } from '@react-spring/three'
import { Hud, PerspectiveCamera, Text, type TextProps } from '@react-three/drei'
import type { GameLobbySchema } from '@schema'
import { useGame } from '@stores'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useMemo, useState } from 'react'
import { MathUtils } from 'three'
import { useParams } from 'wouter'

export function Countdown({ room }: PropsWithRoom<GameLobbySchema>) {
  const { options } = useParams()
  const { username } = JSON.parse(atob(options!))
  const isTouch = useIsTouch()

  const setPhase = useGame(s => s.setPhase)
  const [canStart, setCanStart] = useState(false)
  const [countdown, setCountdown] = useState<number>()
  const [isOwner, setIsOwner] = useState(false)

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
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('owner', owner => setIsOwner(owner === username))
    $(room.state).listen('canStart', setCanStart)
    $(room.state).listen('countdown', countdown => {
      setCountdown(countdown)
      if (countdown <= 10) setPhase('countdown')
    })
  }, [room, username, setPhase])

  const { scale, color } = useSpring({
    from: { scale: 0, color: canStart && isOwner ? 'limegreen' : 'dodgerblue' },
    to: { scale: 1.5, color: canStart && isOwner ? 'limegreen' : 'dodgerblue' },
  })

  const { rotationZ } = useSpring({
    rotationZ: MathUtils.degToRad(0 - clicked * 360),
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
          if (isOwner && canStart) room?.send('start')
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
