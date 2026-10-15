import { useFadeIn, useIsTouch, useSafeInput, useStoredUsername } from '@hooks'
import { a } from '@react-spring/web'
import { lobbyPath } from '@utils'
import clsx from 'clsx'
import { type SubmitEventHandler } from 'react'
import { Link, useLocation, useParams } from 'wouter'

export function JoinRoom() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const params = useParams()
  const [id, setId] = useSafeInput(params.id ?? '')
  const [username, setUsername] = useStoredUsername()

  const onSubmit: SubmitEventHandler = e => {
    e.preventDefault()
    if (!id || !username) return

    navigate(lobbyPath('join', { id: id.toUpperCase(), username }))
  }

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <form className="flex w-full max-w-110 flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            autoFocus={!isTouch && !id}
            className="input w-full"
            placeholder="room code"
            value={id}
            onChange={e => setId(e.target.value)}
          />
          <span className="icon-[mdi--gamepad-variant]" />
        </div>
        <div>
          <input
            autoFocus={!isTouch && !!id}
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
          <button
            type="submit"
            className={clsx('button h-10 flex-1', { disabled: !id || !username })}
          >
            join room
          </button>
        </div>
      </form>
    </a.div>
  )
}
