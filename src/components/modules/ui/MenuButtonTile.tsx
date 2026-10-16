import { ProfileCharacter } from '@components/modules/profile'
import { ModalTile, TileLabel, type ButtonTileProps } from '@components/modules/tiles'
import { animatable, COLORS, getStoredUsername, ROUTES } from '@utils'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuButtonTileProps = Omit<MenuTileProps, 'type'>

const BUTTONS = [PlayButton, HowToPlayButton, ProfileButton, CreditsButton]

const SMALL_LABEL: ButtonTileProps['labelProps'] = {
  fontSize: 0.15,
  lineHeight: 1.1,
  maxWidth: 0.8,
}

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
      // the profile is set up first
      onClick={() => navigate(getStoredUsername() ? '/room' : '/profile')}
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
      labelProps={SMALL_LABEL}
    >
      how to play❓
    </ModalTile>
  )
}

function ProfileButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.profile)
  const [, navigate] = useLocation()

  return (
    <ModalTile
      {...props}
      // still, the character floats on its own
      float={false}
      open={match}
      onClick={() => navigate('/profile')}
    >
      {/* below the character */}
      <TileLabel visible={!match} position={[-0.3, 0.13, 0]} anchorY="middle" fontSize={0.15}>
        profile
      </TileLabel>
      <ProfileCharacter open={match} />
    </ModalTile>
  )
}
