import { Experience, Notification } from '@components'
import { DoubleTapPreventer, ErrorBoundary, GUI } from '@components/helpers'
import { CreateRoom, Credits, GameOverlay, JoinRoom, LobbyOverlay } from '@components/pages'
import { useDebug } from '@hooks'
import { consumePendingNotification, hasSession, leave } from '@multiplayer'
import { useNotification } from '@stores'
import { ROUTES } from '@utils'
import { useEffect } from 'react'
import { Redirect, Route, Switch, useRoute } from 'wouter'

export default function App() {
  const debug = useDebug()
  const notify = useNotification(s => s.notify)
  const [inLobby] = useRoute(ROUTES.lobby)
  const [inGame] = useRoute(ROUTES.game)

  useEffect(() => {
    const message = consumePendingNotification()
    if (message) notify({ message, type: 'error' })
  }, [notify])

  // leaving lobby and game pages means leaving the multiplayer room
  useEffect(() => {
    if (!inLobby && !inGame && hasSession()) leave()
  }, [inLobby, inGame])

  return (
    <>
      <GUI />
      <DoubleTapPreventer />

      <ErrorBoundary>
        <Experience />
        <Notification />
        <Switch>
          <Route path={ROUTES.home} />
          <Route path={ROUTES.create} component={CreateRoom} />
          <Route path={ROUTES.join} component={JoinRoom} />
          <Route path={ROUTES.credits} component={Credits} />
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
