import { useFadeIn, useStoredUsername } from '@hooks'
import { a } from '@react-spring/web'
import { lobbyPath } from '@utils'
import { clsx } from 'clsx'
import { type SubmitEventHandler } from 'react'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()
  const [username, setUsername] = useStoredUsername()

  const onSubmit: SubmitEventHandler = e => {
    e.preventDefault()
    if (!username) return

    navigate(lobbyPath('new', { username }))
  }

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <form className="flex w-full max-w-110 flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            className="input w-full"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="button danger">
            back
          </Link>
          <button type="submit" className={clsx('button h-10 flex-1', { disabled: !username })}>
            create room
          </button>
        </div>
      </form>
    </a.div>
  )
}
