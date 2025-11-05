import { ButtonTile, type ButtonTileProps } from '@components/ButtonTile'
import { ModalTile } from '@components/ModalTile'
import { a } from '@react-spring/three'
import { v4 as uuid } from 'uuid'
import { useLocation, useRoute } from 'wouter'
import type { MenuTileProps } from './MenuTile'

type MenuButtonTileProps = Omit<MenuTileProps, 'type'>

export const MenuButtonTile = a(({ index, ...props }: MenuButtonTileProps) => {
  return [
    <JoinRoomButton {...props} />,
    <CreateRoomButton {...props} />,
    <TrainingRoomButton {...props} />,
    <CreditsButton {...props} />,
  ].at(index!)
})

function CreateRoomButton(props: MenuButtonTileProps) {
  const [match] = useRoute('/new')
  const [, navigate] = useLocation()

  return (
    <ModalTile {...props} color="orange" open={match} onClick={() => navigate('/new')}>
      create room
    </ModalTile>
  )
}

function JoinRoomButton(props: ButtonTileProps) {
  const [match] = useRoute('/join/:id?')
  const [, navigate] = useLocation()

  return (
    <ModalTile {...props} color="orange" open={match} onClick={() => navigate('/join')}>
      join room
    </ModalTile>
  )
}

function TrainingRoomButton(props: ButtonTileProps) {
  const [, navigate] = useLocation()

  return (
    <ButtonTile
      {...props}
      color="orange"
      onClick={() => {
        const options = { id: uuid(), username: uuid(), training: true, countdown: 3 }
        navigate(`/new/lobby/${btoa(JSON.stringify(options))}`)
      }}
    >
      training room
    </ButtonTile>
  )
}

function CreditsButton(props: ButtonTileProps) {
  const [match] = useRoute('/credits')
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
