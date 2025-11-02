import type { TileProps } from '@components'
import { useThree } from '@react-three/fiber'
import { squareGridPosition } from '@utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRoute } from 'wouter'

export type MenuTileProps = TileProps & {
  type: 'base' | 'letter' | 'button'
  index?: number
}

// TODO improve, why do I need this hook I use only in one place?
export function useMenuTiles() {
  const [match] = useRoute(/game|lobby/)
  const { viewport } = useThree()

  const [size] = useState(11)
  const [tiles, setTiles] = useState<MenuTileProps[]>([])

  const center = useMemo(() => Math.floor((size * size) / 2), [size])

  const buttonIndices = useMemo(() => {
    const button1Index = viewport.aspect > 1 ? center + 2 * size - 2 : center - 2 - 2 * size
    const button2Index = viewport.aspect > 1 ? button1Index + 1 : button1Index + 1
    const button3Index = viewport.aspect > 1 ? button1Index - size : button1Index + size
    const button4Index = button3Index - 1

    return [button1Index, button2Index, button3Index, button4Index]
  }, [center, size, viewport.aspect])

  const lettersIndices = useMemo(() => {
    const title1Index = viewport.aspect > 1 ? center - size * 2 + 2 : center + 2
    const title2Index = title1Index + size
    const title3Index = title2Index + size
    const title4Index = title1Index - 1
    const title5Index = title4Index + size
    const title6Index = title5Index + size
    const title7Index = title4Index - 1
    const title8Index = title7Index + size
    const title9Index = title8Index + size

    return [
      title1Index,
      title2Index,
      title3Index,
      title4Index,
      title5Index,
      title6Index,
      title7Index,
      title8Index,
      title9Index,
    ]
  }, [center, size, viewport.aspect])

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
        .map((_, index) => ({
          position: squareGridPosition(index, size),
          ...getType(index),
        })),
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

  useEffect(() => {
    setTiles(tiles => {
      if (match) return []
      return tiles.length ? updateTiles(tiles) : initTiles()
    })
  }, [match, initTiles, updateTiles])

  return tiles
}
