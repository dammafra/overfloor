import { Experience, Notification } from '@components'
import { DoubleTapPreventer, ErrorBoundary, GUI } from '@components/helpers'
import { CreateRoom, Credits, GameOverlay, JoinRoom, LobbyOverlay } from '@components/pages'
import { useDebug } from '@hooks'
import { consumePendingNotification, hasSession, leave } from '@multiplayer'
import { useNotification } from '@stores'
import { useEffect } from 'react'
import { Redirect, Route, Switch, useLocation } from 'wouter'

export default function App() {
  const debug = useDebug()
  const notify = useNotification(s => s.notify)
  const [location] = useLocation()

  useEffect(() => {
    const message = consumePendingNotification()
    if (message) notify({ message, type: 'error' })
  }, [notify])

  // leaving lobby and game pages means leaving the multiplayer room
  useEffect(() => {
    const inRoom = /^\/[^/]+\/lobby\/|^\/game$/.test(location)
    if (!inRoom && hasSession()) leave()
  }, [location])

  return (
    <>
      <GUI />
      <DoubleTapPreventer />

      {/* <StrictMode> */}
      <ErrorBoundary>
        <Experience />
        <Notification />
        <Switch>
          <Route path="/" />
          <Route path="/new" component={CreateRoom} />
          <Route path="/join" component={JoinRoom} />
          <Route path="/join/:id" component={JoinRoom} />
          <Route path="/credits" component={Credits} />
          <Route path="/:from/lobby/:options" component={LobbyOverlay} />
          <Route path="/game" component={GameOverlay} />
          {!debug && (
            <Route>
              <Redirect to="/" />
            </Route>
          )}
        </Switch>
      </ErrorBoundary>

      {/* </StrictMode> */}
    </>
  )
}
