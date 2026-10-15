import { create } from 'zustand'

interface Notification {
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  message: string
}

const DEFAULT_TYPE = 'info'
const DEFAULT_DURATION = 5000

type NotificationStore = {
  notification?: Notification
  notify: (notification: string | Notification) => void
}

let timeout: number | undefined

export const useNotification = create<NotificationStore>()(set => ({
  notify: input => {
    const notification: Notification =
      typeof input === 'string'
        ? { type: DEFAULT_TYPE, duration: DEFAULT_DURATION, message: input }
        : { type: DEFAULT_TYPE, duration: DEFAULT_DURATION, ...input }

    set({ notification })

    // a new notification restarts the timer, so it's not dismissed by the previous one
    clearTimeout(timeout)
    timeout = window.setTimeout(() => set({ notification: undefined }), notification.duration)
  },
}))
