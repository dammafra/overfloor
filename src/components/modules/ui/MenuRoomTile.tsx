import { ProfileCharacter } from '@components/modules/profile'
import { ButtonTile, ModalTile, TileLabel, type ButtonTileProps } from '@components/modules/tiles'
import { animatable, COLORS, getUsername, ICONS, lobbyPath, ROUTES } from '@utils'
import { v4 as uuid } from 'uuid'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuRoomTileProps = Omit<MenuTileProps, 'type'>

// same order as `aspects.ui.tile.room.indices`: top, right, bottom, left. The modal ones by index
// in `ROOM_BUTTON` of `UI` too
const BUTTONS = [CreateButton, JoinButton, PracticeButton, ProfileButton]

// room actions and the profile, in place of the menu buttons once started
export const MenuRoomTile = animatable(({ index, ...props }: MenuRoomTileProps) => {
  const Button = index === undefined ? undefined : BUTTONS.at(index)
  return Button ? <Button {...props} /> : null
})

// as big as "practice" fits in a tile
const LABEL: ButtonTileProps['labelProps'] = { fontSize: 0.19 }

function CreateButton(props: ButtonTileProps) {
  const [, navigate] = useLocation()

  // without a code, Playroom creates a new room
  const create = () => navigate(lobbyPath({ username: getUsername() }))

  return (
    <ButtonTile {...props} color={COLORS.go} labelProps={LABEL} icon={ICONS.add} onClick={create}>
      create
    </ButtonTile>
  )
}

function JoinButton(props: ButtonTileProps) {
  const [match] = useRoute(ROUTES.join)
  const [, navigate] = useLocation()

  return (
    <ModalTile
      {...props}
      color={COLORS.go}
      labelProps={LABEL}
      icon={ICONS.login}
      open={match}
      closeTo="/room"
      onClick={() => navigate('/join')}
    >
      join
    </ModalTile>
  )
}

function PracticeButton(props: ButtonTileProps) {
  const [, navigate] = useLocation()

  // single player room, nobody else can join it
  const practice = () => navigate(lobbyPath({ username: uuid(), practice: true, countdown: 3 }))

  return (
    <ButtonTile
      {...props}
      color={COLORS.ready}
      labelProps={LABEL}
      icon={ICONS.fitnessCenter}
      onClick={practice}
    >
      practice
    </ButtonTile>
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
      closeTo="/room"
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
