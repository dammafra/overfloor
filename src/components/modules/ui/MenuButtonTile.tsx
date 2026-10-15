import { ButtonTile, ModalTile, type ButtonTileProps } from '@components/modules/tiles'
import { animatable, COLORS, lobbyPath, ROUTES } from '@utils'
import { v4 as uuid } from 'uuid'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuButtonTileProps = Omit<MenuTileProps, 'type'>

const BUTTONS = [JoinRoomButton, CreateRoomButton, TrainingRoomButton, CreditsButton]

export const MenuButtonTile = animatable(({ index, ...props }: MenuButtonTileProps) => {
  const Button = index === undefined ? undefined : BUTTONS.at(index)
  return Button ? <Button {...props} /> : null
})

function CreateRoomButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.create)
  const [, navigate] = useLocation()

  return (
    <ModalTile {...props} color={COLORS.button} open={match} onClick={() => navigate('/new')}>
      create room
    </ModalTile>
  )
}

function JoinRoomButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.join)
  const [, navigate] = useLocation()

  return (
    <ModalTile {...props} color={COLORS.button} open={match} onClick={() => navigate('/join')}>
      join room
    </ModalTile>
  )
}

function TrainingRoomButton(props: ButtonTileProps) {
  const [, navigate] = useLocation()

  return (
    <ButtonTile
      {...props}
      color={COLORS.button}
      onClick={() => navigate(lobbyPath('new', { username: uuid(), training: true, countdown: 3 }))}
    >
      training room
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
        lineHeight: 1.2,
        textAlign: 'left',
        visible: !match,
      }}
    >
      made with ♥︎ by dammafra
    </ModalTile>
  )
}
