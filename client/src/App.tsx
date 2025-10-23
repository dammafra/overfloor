import { Experience, LoadTest } from '@components'
import { ErrorBoundary } from '@components/helpers'
import { ChooseRoom, CreateRoom, MainMenu } from '@components/pages'
import { JoinRoom } from '@components/pages/JoinRoom'
import { useDebug } from '@hooks'
import { button, Leva, useControls } from 'leva'
import { toast, ToastContainer } from 'react-toastify'
import { Redirect, Route, Switch, useLocation } from 'wouter'

export default function App() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  //prettier-ignore
  useControls(
    'test',
    {
      DEBUG: button(() => navigate(`/new/lobby/${btoa(JSON.stringify({ id: 'test', username: Math.random().toString(36).slice(2), debug }))}`)),
      'LOAD TEST': button(() => navigate(`/test`)),
      roomId: 'test',
      countdown: { value: 5, min: 0, max: 60, step: 1 },
      CREATE: button(get => navigate(`/new/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: Math.random().toString(36).slice(2), debug, countdown: get('test.countdown') }))}`)),
      JOIN: button(get => navigate(`/join/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: Math.random().toString(36).slice(2) }))}`)),
    },
    { order: 2 },
  )

  return (
    <>
      <div className="absolute right-0 bottom-0 top-26 w-77.5 opacity-90 z-9999 overflow-scroll">
        {/* See https://github.com/pmndrs/leva/issues/552 */}
        <Leva fill flat titleBar={false} theme={{ colors: { elevation2: '#242424' } }} />
      </div>

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
          <Route path="/join" component={ChooseRoom} />
          <Route path="/join/:id" component={JoinRoom} />
          <Route path="/:from/lobby/:options" />
          <Route path="/game/:reservation" />
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
