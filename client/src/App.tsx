import { Experience } from '@components'
import { ErrorBoundary } from '@components/helpers'
import { CreateRoom, JoinOrCreateRoom, MainMenu } from '@components/pages'
import { useDebug } from '@hooks'
import { Leva } from 'leva'
import { toast, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch, useLocation } from 'wouter'

export default function App() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  return (
    <>
      {/* See https://github.com/pmndrs/leva/issues/552 */}
      <Leva hidden={!debug} theme={{ sizes: { rootWidth: '350px' } }} />

      {/* TODO: handle useColyseus side effect */}
      {/* <StrictMode> */}
      <ToastContainer />
      <ErrorBoundary
        onError={() => {
          toast.error('Something went wrong')
          navigate('/', { replace: true })
        }}
      >
        <Experience />
        <Switch>
          <Route path="/" component={MainMenu} />
          <Route path="/new" component={CreateRoom} />
          <Route path="/join" component={JoinOrCreateRoom} />
          <Route path="/:from/lobby/:options" />
          <Route path="/game/:reservation" />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </ErrorBoundary>
      {/* </StrictMode> */}
    </>
  )
}
