import { ButtonTile, ModalTile, type ButtonTileProps } from '@components/modules/tiles'
import { animatable, COLORS, ICONS, ROUTES } from '@utils'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuButtonTileProps = Omit<MenuTileProps, 'type'>

// same order as `aspects.ui.tile.button.indices`
const BUTTONS = [PlayButton, CreditsButton]

export const MenuButtonTile = animatable(({ index, ...props }: MenuButtonTileProps) => {
  const Button = index === undefined ? undefined : BUTTONS.at(index)
  return Button ? <Button {...props} /> : null
})

// not a modal: the room actions take the place of the buttons (see `MenuRoomTile`)
function PlayButton(props: ButtonTileProps) {
  const [, navigate] = useLocation()

  return (
    <ButtonTile
      {...props}
      color={COLORS.button}
      icon={ICONS.playArrow}
      onClick={() => navigate('/room')}
    >
      start
    </ButtonTile>
  )
}

function CreditsButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.credits)
  const [, navigate] = useLocation()

  return (
    <ModalTile
      {...props}
      open={match}
      onClick={() => navigate('/credits')}
      labelProps={{
        fontSize: 0.13,
        lineHeight: 1.1,
        textAlign: 'left',
      }}
    >
      made with ♥︎ by dammafra
    </ModalTile>
  )
}
