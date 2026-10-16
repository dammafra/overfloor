import { useFadeIn, useIsTouch, useSafeInput } from '@hooks'
import { a } from '@react-spring/web'
import { getStoredUsername, lobbyPath, ROOM_CODE_LENGTH } from '@utils'
import { useState, type SubmitEventHandler } from 'react'
import { v4 as uuid } from 'uuid'
import { Link, Redirect, useLocation, useParams } from 'wouter'
import { RoomCodeField } from './RoomCodeField'

// Playroom creates the room if no one is in it yet, so creating and joining share the same form
export function RoomForm() {
  const params = useParams()
  const [username] = useState(getStoredUsername)

  // the profile is set up first, then back here with the same room
  if (!username) return <Redirect to={profilePath(params.id)} replace />

  return <RoomFormContent id={params.id} username={username} />
}

function profilePath(id?: string) {
  return id ? `/profile?${new URLSearchParams({ room: id })}` : '/profile'
}

function RoomFormContent({ id: initialId, username }: { id?: string; username: string }) {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  // without a code, Playroom creates a new room.
  // Uppercase like Playroom's codes: every typed or shared code goes through here
  const [id, setId] = useSafeInput(initialId, { maxLength: ROOM_CODE_LENGTH, uppercase: true })

  const onSubmit: SubmitEventHandler = e => {
    e.preventDefault()
    navigate(lobbyPath({ id: id || undefined, username }))
  }

  // single player room, nobody else can join it
  const practice = () => navigate(lobbyPath({ username: uuid(), practice: true, countdown: 3 }))

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col gap-4">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <RoomCodeField value={id} onChange={setId} autoFocus={!isTouch} />
          <button type="submit" className="button success h-10 w-full">
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
