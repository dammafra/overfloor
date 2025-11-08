import { Experience, GUI, LoadTest } from '@components'
import { DoubleTapPreventer, ErrorBoundary } from '@components/helpers'
import {
  ChooseRoom,
  CreateRoom,
  Credits,
  GameOverlay,
  JoinRoom,
  LobbyOverlay,
} from '@components/pages'
import { useDebug } from '@hooks'
import { button, useControls } from 'leva'
import { v4 as uuid } from 'uuid'
import { Redirect, Route, Switch, useLocation } from 'wouter'

export default function App() {
  const [, navigate] = useLocation()
  const debug = useDebug()

  //prettier-ignore
  useControls(
    'test', {
      roomId: 'test',
      countdown: { value: 5, min: 0, max: 60, step: 1 },
      CREATE: button(get => navigate(`/new/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: uuid(), countdown: get('test.countdown') }))}`)),
      JOIN: button(get => navigate(`/join/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: uuid() }))}`)),
      DEBUG: button(() => navigate(`/new/lobby/${btoa(JSON.stringify({ id: uuid(), username: uuid(), training: true }))}`)),
      'LOAD TEST': button(() => navigate(`/test`)),
    },
    { order: 4, collapsed: true },
  )

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
          <Route path="/game/:reservation" component={GameOverlay} />
          {debug && <Route path="/test" component={LoadTest} />}
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </ErrorBoundary>
      {/* </StrictMode> */}
    </>
  )
}
