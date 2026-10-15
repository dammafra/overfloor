import { ModalTile, type ButtonTileProps } from '@components/modules/tiles'
import { animatable, COLORS, ROUTES } from '@utils'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuButtonTileProps = Omit<MenuTileProps, 'type'>

const BUTTONS = [PlayButton, CreditsButton]

export const MenuButtonTile = animatable(({ index, ...props }: MenuButtonTileProps) => {
  const Button = index === undefined ? undefined : BUTTONS.at(index)
  return Button ? <Button {...props} /> : null
})

function PlayButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.room)
  const [, navigate] = useLocation()

  return (
    <ModalTile {...props} color={COLORS.button} open={match} onClick={() => navigate('/room')}>
      play
    </ModalTile>
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
        lineHeight: 1.2,
        textAlign: 'left',
        visible: !match,
      }}
    >
      made with ♥︎ by dammafra
    </ModalTile>
  )
}
