import { Experience, GUI } from '@components'
import { ErrorBoundary } from '@components/helpers'
import { ChooseRoom, CreateRoom, MainMenu } from '@components/pages'
import { JoinRoom } from '@components/pages/JoinRoom'
import { Test } from '@components/test'
import { useDebug } from '@hooks'
import { toast, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch, useLocation } from 'wouter'

export default function App() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  return (
    <>
      <GUI />

      {/* TODO: handle useColyseus side effect */}
      {/* <StrictMode> */}
      <ToastContainer position="bottom-right" />
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
          <Route path="/join" component={ChooseRoom} />
          <Route path="/join/:id" component={JoinRoom} />
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
