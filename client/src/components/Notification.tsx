import { a, useTransition } from '@react-spring/web'
import { useNotification } from '@stores'
import clsx from 'clsx'

export function Notification() {
  const notification = useNotification(s => s.notification)

  const transition = useTransition(notification, {
    from: { scale: 0, opacity: 0 },
    enter: { scale: 1, opacity: 1 },
    leave: { scale: 0, opacity: 0 },
    config: { tension: 300, friction: 20 },
  })

  return transition(
    (spring, notification) =>
      notification && (
        <a.div
          style={spring}
          className={clsx(
            'backdrop-blur-xs fixed top-4 left-4 px-4 py-2 rounded-xl text-xl text-white text-stroke-black',
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
