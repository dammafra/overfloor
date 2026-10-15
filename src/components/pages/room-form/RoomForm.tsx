import { useFadeIn, useIsTouch, useSafeInput, useStoredUsername } from '@hooks'
import { a } from '@react-spring/web'
import { lobbyPath, ROOM_CODE_LENGTH } from '@utils'
import clsx from 'clsx'
import { type SubmitEventHandler } from 'react'
import { v4 as uuid } from 'uuid'
import { Link, useLocation, useParams } from 'wouter'
import { Field } from './Field'
import { RoomCodeField } from './RoomCodeField'

// Playroom creates the room if no one is in it yet, so creating and joining share the same form
export function RoomForm() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const params = useParams()
  // without a code, Playroom creates a new room.
  // Uppercase like Playroom's codes: every typed or shared code goes through here
  const [id, setId] = useSafeInput(params.id, { maxLength: ROOM_CODE_LENGTH, uppercase: true })
  const [username, setUsername] = useStoredUsername()

  const onSubmit: SubmitEventHandler = e => {
    e.preventDefault()
    if (!username) return

    navigate(lobbyPath({ id: id || undefined, username }))
  }

  // single player room, nobody else can join it
  const practice = () => navigate(lobbyPath({ username: uuid(), practice: true, countdown: 3 }))

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col gap-4">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <RoomCodeField value={id} onChange={setId} />
          <Field
            id="username"
            icon="icon-[mdi--user]"
            label="username"
            autoFocus={!isTouch}
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className={clsx('button success h-10 w-full', { disabled: !username })}
          >
            {id ? 'join' : 'create'} room
          </button>
        </form>

        <div className="flex items-center gap-2 text-white text-stroke-black">
          <hr className="flex-1 border-white/40" />
          or
          <hr className="flex-1 border-white/40" />
        </div>

        <div className="flex gap-4">
          <Link href="/" className="button danger">
            go back
          </Link>
          <button type="button" className="button accent h-10 flex-1" onClick={practice}>
            practice
          </button>
        </div>
      </div>
    </a.div>
  )
}
