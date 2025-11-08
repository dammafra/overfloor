import { Experience, GUI } from '@components'
import { DoubleTapPreventer, ErrorBoundary } from '@components/helpers'
import { Test } from '@components/modules/test'
import { ChooseRoom, CreateRoom, Credits, JoinRoom, LobbyOverlay } from '@components/pages'
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
          <Route path="/new" component={CreateRoom} />
          <Route path="/join" component={ChooseRoom} />
          <Route path="/join/:id" component={JoinRoom} />
          <Route path="/credits" component={Credits} />
          <Route path="/:from/lobby/:options" component={LobbyOverlay} />
          <Route path="/:from/lobby/:options" /> {/* delegate to Experience */}
          <Route path="/game/:reservation" /> {/* delegate to Experience */}
          {debug && <Route path="/test" />} {/* delegate to Test */}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>

        {debug && <Test />}
      </ErrorBoundary>
      {/* </StrictMode> */}
    </>
  )
}
