import { Experience, GUI } from '@components'
import { DoubleTapPreventer, ErrorBoundary } from '@components/helpers'
import { TestRoutes } from '@components/modules/test'
import {
  ChooseRoom,
  CreateRoom,
  Credits,
  GameOverlay,
  JoinRoom,
  LobbyOverlay,
} from '@components/pages'
import { useDebug } from '@hooks'
import { Redirect, Route, Switch } from 'wouter'

export default function App() {
  const debug = useDebug()

  return (
    <>
      <GUI />
      <DoubleTapPreventer />

      {/* TODO: handle useColyseus side effect */}
      {/* <StrictMode> */}
      <ErrorBoundary>
        <Experience />
        <Switch>
          <Route path="/" />
          <Route path="/new" component={CreateRoom} />
          <Route path="/join" component={ChooseRoom} />
          <Route path="/join/:id" component={JoinRoom} />
          <Route path="/credits" component={Credits} />
          <Route path="/:from/lobby/:options" component={LobbyOverlay} />
          <Route path="/game/:reservation" component={GameOverlay} />
          {!debug && (
            <Route>
              <Redirect to="/" />
            </Route>
          )}
        </Switch>
        <TestRoutes />
      </ErrorBoundary>

      {/* </StrictMode> */}
    </>
  )
}
