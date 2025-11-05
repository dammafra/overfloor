import { useTransition } from '@react-spring/three'
import { Sparkles } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { aspects, positions } from '@utils'
import { useCallback, useMemo, useRef } from 'react'
import { type Vector3Tuple } from 'three'
import { useRoute } from 'wouter'
import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { Cursor } from './Cursor'
import { MenuTile, type MenuTileProps } from './MenuTile'

type MenuTileSprings = {
  position: Vector3Tuple
  scale: number
  rotate: boolean
  type: MenuTileProps['type']
  index: number
}

export function UI() {
  const [matchGame] = useRoute(/game/)
  const [matchLobby] = useRoute(/lobby/)
  const match = matchGame || matchLobby
  const { viewport } = useThree()

  const size = useMemo(() => (matchGame ? 0 : 11), [matchGame, matchLobby])
  const tiles = useMemo(() => [...Array(size * size).keys()], [size])
  const firstRenderRef = useRef(true)

  const buttonIndices = useMemo(
    () => aspects.ui.tile.button.indices(size, viewport.aspect),
    [size, viewport.aspect],
  )

  const lettersIndices = useMemo(
    () => aspects.ui.tile.letter.indices(size, viewport.aspect),
    [size, viewport.aspect],
  )

  const getTilePosition = useCallback(
    (index: number) => (matchLobby ? positions.lobby.tile(index) : positions.ui.tile(index, size)),
    [size, matchLobby],
  )

  // TODO improve
  const getTileType = useCallback(
    (index: number) =>
      matchLobby
        ? 'base'
        : buttonIndices.includes(index)
          ? 'button'
          : lettersIndices.includes(index)
            ? 'letter'
            : 'base',
    [buttonIndices, lettersIndices, matchLobby],
  )

  // TODO improve
  const getTileIndex = useCallback(
    (index: number) =>
      matchLobby
        ? undefined
        : buttonIndices.includes(index)
          ? buttonIndices.indexOf(index)
          : lettersIndices.includes(index)
            ? lettersIndices.indexOf(index)
            : undefined,
    [buttonIndices, lettersIndices, matchLobby],
  )

  const transitions = useTransition<number, MenuTileSprings>(tiles, {
    from: (_, i) => ({
      position: getTilePosition(i),
      scale: 0,
      rotate: false,
      type: getTileType(i),
      index: getTileIndex(i),
    }),
    enter: (_, i) => ({
      scale: 1,
      delay: firstRenderRef.current ? i * 10 : 0,
    }),
    leave: () => ({
      scale: 0,
    }),
    update: (_, i) => ({
      position: getTilePosition(i),
      rotate: matchLobby,
      type: getTileType(i),
      index: getTileIndex(i),
      config: { friction: matchLobby ? 150 : 50 },
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: { mass: 1, tension: 120, friction: 15 },
  })

  return (
    <>
      {transitions(spring => (
        <MenuTile {...spring} />
      ))}

      {!match && <Backdrop />}
      {!match && <Cursor />}
      {!match && <CameraRig />}
      <Sparkles scale={100} count={1000} size={10} />
    </>
  )
}
