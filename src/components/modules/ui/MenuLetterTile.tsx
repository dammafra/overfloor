import { LetterTile } from '@components/modules/tiles'
import { animatable } from '@utils'
import type { MenuTileProps } from './MenuTile'

type MenuLetterTileProps = Omit<MenuTileProps, 'type'>

export const MenuLetterTile = animatable(({ index, ...props }: MenuLetterTileProps) => {
  if (typeof index === 'undefined') return <></>

  return (
    <LetterTile {...props} color={index < 4 ? 'brown' : 'limegreen'}>
      {'OVERFLOOR'.at(index)}
    </LetterTile>
  )
})
