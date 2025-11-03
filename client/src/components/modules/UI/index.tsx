import { useTransition } from '@react-spring/three'
import { useThree } from '@react-three/fiber'
import { aspects, positions } from '@utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Vector3Tuple } from 'three'
import { useRoute } from 'wouter'
import { Backdrop } from './Backdrop'
import { CameraRig } from './CameraRig'
import { Cursor } from './Cursor'
import { MenuTile, type MenuTileProps } from './MenuTile'

interface UISpringProps {
  position: Vector3Tuple
  scale: number
}

export function UI() {
  const [match] = useRoute(/game|lobby/)
  const { viewport } = useThree()

  const [size] = useState(11)
  const [tiles, setTiles] = useState<MenuTileProps[]>([])
  const firstRenderRef = useRef(true)

  const buttonIndices = useMemo(
    () => aspects.ui.tile.button.indices(size, viewport.aspect),
    [size, viewport.aspect],
  )

  const lettersIndices = useMemo(
    () => aspects.ui.tile.letter.indices(size, viewport.aspect),
    [size, viewport.aspect],
  )

  const getType = useCallback(
    (index: number): MenuTileProps => {
      if (buttonIndices.includes(index))
        return { type: 'button', index: buttonIndices.indexOf(index) }
      if (lettersIndices.includes(index))
        return { type: 'letter', index: lettersIndices.indexOf(index) }

      return { type: 'base' }
    },
    [buttonIndices, lettersIndices],
  )

  const initTiles = useCallback(
    () =>
      Array(size * size)
        .fill(true)
        .map((_, index) => ({ position: positions.ui.tile(index, size), ...getType(index) })),
    [size, getType],
  )

  const updateTiles = useCallback(
    (tiles: MenuTileProps[]) =>
      tiles.map((t, index) => {
        const updatedTile = getType(index)
        t.type = updatedTile.type
        t.index = updatedTile.index
        return t
      }),
    [getType],
  )

  const swapTiles = useCallback(
    (tiles: MenuTileProps[]) =>
      tiles.map((t, index) => {
        const updatedTile = getType(index)
        return updatedTile.type === t.type && updatedTile.index === t.index
          ? t
          : { position: t.position, ...updatedTile }
      }),
    [getType],
  )

  useEffect(() => {
    setTiles(tiles => {
      if (match) return []
      return tiles.length ? swapTiles(tiles) : initTiles()
    })
  }, [match, initTiles, swapTiles, updateTiles])

  const transitions = useTransition<MenuTileProps, UISpringProps>(tiles, {
    from: tile => ({
      position: tile.position,
      scale: 0,
    }),
    enter: (_, i) => ({
      scale: 1,
      delay: firstRenderRef.current ? i * 10 : 0,
    }),
    leave: () => ({
      scale: 0,
      config: { tension: 0 },
    }),
    onRest: () => {
      firstRenderRef.current = false
    },
    config: { mass: 1, tension: 120, friction: 14 },
  })

  return (
    <>
      {transitions((spring, props, _, i) => (
        <MenuTile
          key={`menu-tile-${i}`}
          position={spring.position}
          scale={spring.scale}
          {...props}
        />
      ))}

      {!match && <Backdrop />}
      {!match && <Cursor />}
      {!match && <CameraRig />}
    </>
  )
}
