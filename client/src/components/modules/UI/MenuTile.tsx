import { Dynamic } from '@components/helpers'
import { Tile, type TileProps } from '@components/modules/tiles'
import { a } from '@react-spring/three'
import { MenuButtonTile } from './MenuButtonTile'
import { MenuLetterTile } from './MenuLetterTile'

export type MenuTileProps = TileProps & {
  type: 'base' | 'letter' | 'button'
  index?: number
}

export const MenuTile = a(({ type, index, ...props }: MenuTileProps) => {
  const a = type !== 'base' ? { index } : undefined
  return (
    <Dynamic
      component={type === 'button' ? MenuButtonTile : type === 'letter' ? MenuLetterTile : Tile}
      {...a}
      {...props}
    />
  )
})
