import { useDebug } from '@hooks'
import clsx from 'clsx'
import { Leva } from 'leva'

export function GUI() {
  const debug = useDebug()

  return (
    <div
      className={clsx(
        'absolute left-0 bottom-0 top-26 w-77.5 opacity-90 z-9999 overflow-scroll',
        !debug && 'hidden',
      )}
    >
      {/* See https://github.com/pmndrs/leva/issues/552 */}
      <Leva
        hidden={!debug}
        fill
        flat
        titleBar={false}
        theme={{ colors: { elevation2: '#242424' } }}
      />
    </div>
  )
}
