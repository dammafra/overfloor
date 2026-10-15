import { useFadeIn, useIsTouch, useSafeInput, useStoredUsername } from '@hooks'
import { a } from '@react-spring/web'
import { generateRoomCode, lobbyPath } from '@utils'
import clsx from 'clsx'
import { type SubmitEventHandler } from 'react'
import { v4 as uuid } from 'uuid'
import { Link, useLocation, useParams } from 'wouter'

// Playroom creates the room if no one is in it yet, so creating and joining share the same form
export function RoomForm() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const params = useParams()
  // without a shared code, suggest a Playroom-like one, still editable
  const [id, setId] = useSafeInput(params.id ?? generateRoomCode())
  const [username, setUsername] = useStoredUsername()

  const onSubmit: SubmitEventHandler = e => {
    e.preventDefault()
    if (!id || !username) return

    navigate(lobbyPath({ id: id.toUpperCase(), username }))
  }

  // single player room, nobody else can join it
  const practice = () =>
    navigate(lobbyPath({ id: generateRoomCode(), username: uuid(), practice: true, countdown: 3 }))

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col gap-4">
        <button type="button" className="button h-10 w-full" onClick={practice}>
          practice
        </button>

        <div className="flex items-center gap-2 text-white text-stroke-black">
          <hr className="flex-1 border-white/40" />
          or
          <hr className="flex-1 border-white/40" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div>
            <input
              className="input w-full"
              placeholder="room code"
              value={id}
              onChange={e => setId(e.target.value)}
            />
            <span className="icon-[mdi--gamepad-variant]" />
          </div>
          <div>
            <input
              autoFocus={!isTouch}
              className="input w-full"
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <span className="icon-[mdi--user]" />
          </div>
          <button
            type="submit"
            className={clsx('button success h-10 w-full', { disabled: !id || !username })}
          >
            start
          </button>
        </form>

        <Link href="/" className="button danger mt-4 self-center">
          back
        </Link>
      </div>
    </a.div>
  )
}
