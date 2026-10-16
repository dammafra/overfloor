import { Experience, Notification } from '@components'
import { DoubleTapPreventer, ErrorBoundary, GUI, ScrollResetter } from '@components/helpers'
import { Credits, GameOverlay, HowToPlay, LobbyOverlay, Profile, RoomForm } from '@components/pages'
import { useDebug } from '@hooks'
import { hasSession, leave } from '@multiplayer'
import { ROUTES } from '@utils'
import { useEffect } from 'react'
import { Redirect, Route, Switch, useRoute } from 'wouter'

export default function App() {
  const debug = useDebug()
  const [inLobby] = useRoute(ROUTES.lobby)
  const [inGame] = useRoute(ROUTES.game)

  // leaving lobby and game pages means leaving the multiplayer room
  useEffect(() => {
    if (!inLobby && !inGame && hasSession()) leave()
  }, [inLobby, inGame])

  return (
    <>
      <GUI />
      <DoubleTapPreventer />
      <ScrollResetter />

      <ErrorBoundary>
        <Experience />
        <Notification />
        <Switch>
          <Route path={ROUTES.home} />
          <Route path={ROUTES.room} component={RoomForm} />
          <Route path={ROUTES.credits} component={Credits} />
          <Route path={ROUTES.howToPlay} component={HowToPlay} />
          <Route path={ROUTES.profile} component={Profile} />
          <Route path={ROUTES.lobby} component={LobbyOverlay} />
          <Route path={ROUTES.game} component={GameOverlay} />
          {!debug && (
            <Route>
              <Redirect to="/" />
            </Route>
          )}
        </Switch>
      </ErrorBoundary>
    </>
  )
}
