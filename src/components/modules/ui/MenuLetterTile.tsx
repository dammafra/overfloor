import { LetterTile } from '@components/modules/tiles'
import { animatable, COLORS } from '@utils'
import type { MenuTileProps } from './MenuTile'

type MenuLetterTileProps = Omit<MenuTileProps, 'type'>

export const MenuLetterTile = animatable(({ index, ...props }: MenuLetterTileProps) => {
  if (index === undefined) return null

  return (
    <LetterTile {...props} color={index < 4 ? COLORS.danger : COLORS.go}>
      {'OVERFLOOR'.at(index)}
    </LetterTile>
  )
})
