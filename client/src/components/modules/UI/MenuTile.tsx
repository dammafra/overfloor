import { Dynamic } from '@components/helpers'
import { Tile, type TileProps } from '@components/Tile'
import { a } from '@react-spring/three'
import { ButtonTile } from './ButtonTile'
import { LetterTile } from './LetterTile'

export type MenuTileProps = TileProps & {
  type: 'base' | 'letter' | 'button'
  index?: number
}

export const MenuTile = a(({ type, index, ...props }: MenuTileProps) => {
  const a = type !== 'base' ? { index } : undefined
  return (
    <Dynamic
      component={type === 'button' ? ButtonTile : type === 'letter' ? LetterTile : Tile}
      {...a}
      {...props}
    />
  )
})
