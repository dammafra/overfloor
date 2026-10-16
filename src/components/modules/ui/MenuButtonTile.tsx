import { ModalTile, type ButtonTileProps } from '@components/modules/tiles'
import { animatable, COLORS, ROUTES } from '@utils'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuButtonTileProps = Omit<MenuTileProps, 'type'>

const BUTTONS = [PlayButton, CreditsButton, HowToPlayButton]

export const MenuButtonTile = animatable(({ index, ...props }: MenuButtonTileProps) => {
  const Button = index === undefined ? undefined : BUTTONS.at(index)
  return Button ? <Button {...props} /> : null
})

function PlayButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.room)
  const [, navigate] = useLocation()

  return (
    <ModalTile
      {...props}
      labelProps={{ lineHeight: 1.1 }}
      color={COLORS.button}
      open={match}
      onClick={() => navigate('/room')}
    >
      ▶️ start
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
        lineHeight: 1.1,
        textAlign: 'left',
      }}
    >
      made with ♥︎ by dammafra
    </ModalTile>
  )
}

function HowToPlayButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.howToPlay)
  const [, navigate] = useLocation()

  return (
    <ModalTile
      {...props}
      open={match}
      onClick={() => navigate('/tutorial')}
      labelProps={{
        fontSize: 0.15,
        lineHeight: 1.1,
        maxWidth: 0.8,
      }}
    >
      how to play❓
    </ModalTile>
  )
}
