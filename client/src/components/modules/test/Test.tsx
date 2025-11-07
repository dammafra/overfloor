import { button, useControls } from 'leva'
import { v4 as uuid } from 'uuid'
import { Route, useLocation } from 'wouter'
import { LoadTest } from './LoadTest'

export function Test() {
  const [, navigate] = useLocation()

  //prettier-ignore
  useControls(
    'test',
    {
      roomId: 'test',
      countdown: { value: 5, min: 0, max: 60, step: 1 },
      CREATE: button(get => navigate(`/new/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: uuid(), countdown: get('test.countdown') }))}`)),
      JOIN: button(get => navigate(`/join/lobby/${btoa(JSON.stringify({ id: get('test.roomId'), username: uuid() }))}`)),
      DEBUG: button(() => navigate(`/new/lobby/${btoa(JSON.stringify({ id: 'test', username: uuid(), training: true }))}`)),
      'LOAD TEST': button(() => navigate(`/test`)),
    },
    { order: 4, collapsed: true },
  )

  return <Route path="/test" component={LoadTest} />
}
