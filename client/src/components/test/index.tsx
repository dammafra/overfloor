import { useDebug } from '@hooks'
import { button, useControls } from 'leva'
import { Route, useLocation } from 'wouter'
import { LoadTest } from './LoadTest'

export function Test() {
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

  return <Route path="/test" component={LoadTest} />
}
