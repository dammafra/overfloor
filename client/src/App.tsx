import { Experience, GUI } from '@components'
import { DoubleTapPreventer, ErrorBoundary } from '@components/helpers'
import { Test } from '@components/modules/test'
import { ChooseRoom, CreateRoom, Credits, JoinRoom } from '@components/pages'
import { useDebug } from '@hooks'
import { toast, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch, useLocation } from 'wouter'

export default function App() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  return (
    <>
      <GUI />
      <DoubleTapPreventer />

      {/* TODO: handle useColyseus side effect */}
      {/* <StrictMode> */}
      <ToastContainer position="top-right" />
      <ErrorBoundary
        onError={() => {
          toast.error('Something went wrong')
          navigate('/', { replace: true })
        }}
      >
        <Experience />
        <Switch>
          <Route path="/new" component={CreateRoom} />
          <Route path="/join" component={ChooseRoom} />
          <Route path="/join/:id" component={JoinRoom} />
          <Route path="/credits" component={Credits} />
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
