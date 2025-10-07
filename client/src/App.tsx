import { Experience } from '@components'
import { ErrorBoundary } from '@components/helpers'
import { CreateRoom, JoinOrCreateRoom, Lobby, MainMenu } from '@components/pages'
import { useDebug } from '@hooks'
import { Leva } from 'leva'
import { ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch } from 'wouter'

// TODO css/components refactor

export default function App() {
  const debug = useDebug()

  return (
    <>
      {/* See https://github.com/pmndrs/leva/issues/552 */}
      <Leva hidden={!debug} theme={{ sizes: { rootWidth: '350px' } }} />

      {/* TODO: handle useColyseus side effect */}
      {/* <StrictMode> */}
      <ToastContainer />
      <ErrorBoundary>
        <Switch>
          <Route path="/" component={MainMenu} />
          <Route path="/new" component={CreateRoom} />
          <Route path="/join" component={JoinOrCreateRoom} />
          <Route path="/:from/lobby/:options" component={Lobby} />
          <Route path="/test" component={Experience} />

          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </ErrorBoundary>
      {/* </StrictMode> */}
    </>
  )
}
