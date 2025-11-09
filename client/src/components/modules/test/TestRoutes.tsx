import { useDebug } from '@hooks'
import { button, useControls } from 'leva'
import { v4 as uuid } from 'uuid'
import { Route, Switch, useLocation } from 'wouter'
import { LoadTest } from './LoadTest'

export function TestRoutes() {
  const debug = useDebug()
  const [, navigate] = useLocation()

  //prettier-ignore
  useControls(
    'test',
    {
      roomId: 'test',
      countdown: { value: 5, min: 0, max: 60, step: 1 },
      CREATE: button(get => navigate(`/new/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: uuid(), countdown: get('test.countdown') }))}`)),
      JOIN: button(get => navigate(`/join/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: uuid() }))}`)),
      DEBUG: button(() => navigate(`/new/lobby/${btoa(JSON.stringify({ id: uuid(), username: uuid(), training: true }))}`)),
      'LOAD TEST': button(() => navigate(`/test/load`)),
      'OFFLINE TEST': button(() => navigate(`/test/offline`)),
    },
    { order: 4, collapsed: true },
  )

  return (
    debug && (
      <Switch>
        <Route path="/test/load" component={LoadTest} />
        <Route path="/test/offline" /> {/* delegate to Experience */}
      </Switch>
    )
  )
}
