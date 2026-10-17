import { Tile, type TileProps } from '@components/modules/tiles'
import { animatable } from '@utils'
import { MenuButtonTile } from './MenuButtonTile'
import { MenuLetterTile } from './MenuLetterTile'
import { MenuRoomTile } from './MenuRoomTile'

export type MenuTileProps = TileProps & {
  type: 'base' | 'letter' | 'button' | 'room'
  index?: number
}

export const MenuTile = animatable(({ type, index, ...props }: MenuTileProps) => {
  if (type === 'button') return <MenuButtonTile index={index} {...props} />
  if (type === 'room') return <MenuRoomTile index={index} {...props} />
  if (type === 'letter') return <MenuLetterTile index={index} {...props} />
  return <Tile {...props} />
})
