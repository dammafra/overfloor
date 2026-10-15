import { a, useTransition } from '@react-spring/web'
import { useNotification } from '@stores'
import { POP_TRANSITION } from '@utils'
import clsx from 'clsx'

export function Notification() {
  const notification = useNotification(s => s.notification)

  const transition = useTransition(notification, POP_TRANSITION)

  return transition(
    (spring, notification) =>
      notification && (
        <a.div
          style={spring}
          className={clsx(
            'fixed top-4 left-4 rounded-xl px-4 py-2 text-xl text-white backdrop-blur-xs text-stroke-black',
            {
              'bg-white/20': notification.type === 'info',
              'bg-green-500/60': notification.type === 'success',
              'bg-amber-400/60': notification.type === 'warning',
              'bg-rose-700/60': notification.type === 'error',
            },
          )}
        >
          {notification.message}
        </a.div>
      ),
  )
}
