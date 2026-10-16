import { useFadeIn, useIsTouch, useSafeInput } from '@hooks'
import { a } from '@react-spring/web'
import { getStoredUsername, lobbyPath, ROOM_CODE_LENGTH, sanitizeInput } from '@utils'
import clsx from 'clsx'
import { useState, type SubmitEventHandler } from 'react'
import { v4 as uuid } from 'uuid'
import { Link, Redirect, useLocation, useParams } from 'wouter'
import { RoomCodeField } from './RoomCodeField'

// Uppercase like Playroom's codes: every typed or shared code goes through it
const ROOM_CODE_INPUT = { maxLength: ROOM_CODE_LENGTH, uppercase: true }

// creating and joining a room as separate actions, a shared link joining its room right away
export function RoomForm() {
  const params = useParams()
  const [username] = useState(getStoredUsername)
  const id = sanitizeInput(params.id ?? '', ROOM_CODE_INPUT) || undefined

  // the profile is set up first, then on to the lobby (of the shared room, if any)
  if (!username) return <Redirect to={id ? `/profile/${id}` : '/profile'} replace />
  if (id) return <Redirect to={lobbyPath({ id, username })} replace />

  return <RoomFormContent username={username} />
}

function RoomFormContent({ username }: { username: string }) {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const [id, setId] = useSafeInput('', ROOM_CODE_INPUT)

  // without a code, Playroom creates a new room
  const create = () => navigate(lobbyPath({ username }))

  const join: SubmitEventHandler = e => {
    e.preventDefault()
    if (id) navigate(lobbyPath({ id, username }))
  }

  // single player room, nobody else can join it
  const practice = () => navigate(lobbyPath({ username: uuid(), practice: true, countdown: 3 }))

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col gap-4">
        <button type="button" className="button success h-10 w-full" onClick={create}>
          create room
        </button>

        <Or />

        <form className="flex flex-col gap-4" onSubmit={join}>
          <RoomCodeField value={id} onChange={setId} autoFocus={!isTouch} />
          <button
            type="submit"
            className={clsx('button success h-10 w-full', { disabled: !id })}
            disabled={!id}
          >
            join room
          </button>
        </form>

        <Or />

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

function Or() {
  return (
    <div className="flex items-center gap-2 text-white text-stroke-black">
      <hr className="flex-1 border-white/40" />
      or
      <hr className="flex-1 border-white/40" />
    </div>
  )
}
