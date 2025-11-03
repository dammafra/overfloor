import { Tile } from '@components/Tile'
import type { MenuTileProps } from '@hooks'
import { a, useSpring } from '@react-spring/three'
import { Text, useCursor, type TextProps } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Children, useEffect, useMemo, useState, type ReactNode } from 'react'
import { MathUtils, type Vector3Tuple } from 'three'
import { v4 as uuid } from 'uuid'
import { useLocation, useRoute } from 'wouter'
import { getCameraDistance } from './CameraRig'

type ButtonTileProps = Omit<MenuTileProps, 'type'>

export const ButtonTile = a(({ index, ...props }: ButtonTileProps) => {
  return [
    <JoinRoomButton {...props} />,
    <CreateRoomButton {...props} />,
    <TrainingRoomButton {...props} />,
    <CreditsButton {...props} />,
  ].at(index!)
})

function CreateRoomButton(props: ButtonTileProps) {
  const { viewport } = useThree()
  const [match] = useRoute('/new')
  const [, navigate] = useLocation()

  const spring = useSpring({
    position: (match
      ? [0, getCameraDistance(viewport.aspect) - 2, 0]
      : props.position) as Vector3Tuple,
    rotationX: MathUtils.degToRad(match ? 360 : 0),
    color: match ? 'dodgerblue' : 'orange',
  })

  return (
    <BaseButtonTile
      {...props}
      onClick={() => navigate('/new')}
      position={spring.position}
      rotation-x={spring.rotationX}
      color={spring.color}
      labelProps={{ visible: !match }}
    >
      create room
    </BaseButtonTile>
  )
}

function JoinRoomButton(props: ButtonTileProps) {
  const { viewport } = useThree()
  const [match] = useRoute('/join/:id?')
  const [, navigate] = useLocation()

  const spring = useSpring({
    position: (match
      ? [0, getCameraDistance(viewport.aspect) - 2, 0]
      : props.position) as Vector3Tuple,
    rotationX: MathUtils.degToRad(match ? 360 : 0),
    color: match ? 'dodgerblue' : 'orange',
  })

  return (
    <BaseButtonTile
      {...props}
      onClick={() => navigate('/join')}
      position={spring.position}
      rotation-x={spring.rotationX}
      color={spring.color}
      labelProps={{ visible: !match }}
    >
      join room
    </BaseButtonTile>
  )
}

function TrainingRoomButton(props: ButtonTileProps) {
  const [, navigate] = useLocation()

  return (
    <BaseButtonTile
      {...props}
      color="orange"
      onClick={() => {
        const options = { id: uuid(), username: uuid(), training: true, countdown: 3 }
        navigate(`/lobby/${btoa(JSON.stringify(options))}`)
      }}
    >
      training room
    </BaseButtonTile>
  )
}

function CreditsButton(props: ButtonTileProps) {
  const { viewport } = useThree()
  const [match] = useRoute('/credits')
  const [, navigate] = useLocation()

  const spring = useSpring({
    position: (match
      ? [0, getCameraDistance(viewport.aspect) - 2, 0]
      : props.position) as Vector3Tuple,
    rotationX: MathUtils.degToRad(match ? 360 : 0),
    float: !match,
  })

  return (
    <BaseButtonTile
      {...props}
      color="royalblue"
      labelProps={{
        fontSize: 0.14,
        lineHeight: 1.2,
        anchorY: -0.35,
        textAlign: 'left',
        visible: !match,
      }}
      onClick={() => navigate('/credits')}
      position={spring.position}
      rotation-x={spring.rotationX}
      float={spring.float}
    >
      made by dammafra
    </BaseButtonTile>
  )
}

type BaseButtonTileProps = ButtonTileProps & {
  labelProps?: Omit<TextProps, 'children'>
}

const BaseButtonTile = a(({ children, labelProps, ...props }: BaseButtonTileProps) => {
  const [label, setLabel] = useState<string>()
  const [icon, setIcon] = useState<ReactNode>()
  const iconPosition = useMemo<Vector3Tuple>(() => [label ? 0.25 : 0, 0.25, 0], [label])

  useEffect(() => {
    Children.forEach(children, child => {
      if (typeof child === 'string') setLabel(child)
      else setIcon(child)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const spring = useSpring({
    scale: hovered ? 1.1 : (props.scale as number),
    config: { mass: 1, tension: 120, friction: 14 },
  })

  return (
    <Tile
      {...props}
      scale={spring.scale}
      onPointerOver={e => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={e => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      {icon && (
        <group position={iconPosition} scale={0.15} castShadow>
          {icon}
        </group>
      )}
      {label && (
        <Text
          font="/fonts/audiowide.ttf"
          textAlign="center"
          anchorY={icon ? 'top' : 'middle'}
          maxWidth={0.8}
          lineHeight={0.9}
          fontSize={0.2}
          position-y={[0.13]}
          outlineWidth={0.005}
          rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
          {...labelProps}
        >
          {label}
        </Text>
      )}
    </Tile>
  )
})
