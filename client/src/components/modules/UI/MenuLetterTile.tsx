import { LetterTile } from '@components/LetterTile'
import { a } from '@react-spring/three'
import type { MenuTileProps } from './MenuTile'

type MenuLetterTileProps = Omit<MenuTileProps, 'type'>

export const MenuLetterTile = a(({ index, ...props }: MenuLetterTileProps) => {
  if (typeof index === 'undefined') return <></>

  return (
    <LetterTile {...props} color={index < 4 ? 'brown' : 'limegreen'}>
      {'OVERFLOOR'.at(index)}
    </LetterTile>
  )
})
