import { useEscape, useFadeIn, useIsTouch, useSafeInput } from '@hooks'
import { a } from '@react-spring/web'
import { getRecentRooms, getUsername, lobbyPath, ROOM_CODE_LENGTH, sanitizeInput } from '@utils'
import clsx from 'clsx'
import { useState, type ReactNode, type SubmitEventHandler } from 'react'
import { Link, Redirect, useLocation, useParams } from 'wouter'
import { Field } from './Field'

// Uppercase like Playroom's codes: every typed or shared code goes through it
const ROOM_CODE_INPUT = { maxLength: ROOM_CODE_LENGTH, uppercase: true }

// a shared link (`/room/:id`) joins its room right away, the room actions are tiles in the 3D scene
// otherwise (see `MenuRoomTile`)
export function SharedRoom() {
  const params = useParams()
  // back to the menu, not from the open modals: they go back here
  useEscape('/')

  const id = sanitizeInput(params.id ?? '', ROOM_CODE_INPUT) || undefined

  return id ? <Redirect to={lobbyPath({ id, username: getUsername() })} replace /> : null
}

// joining a room by its code, or straight to one of the recent ones below, opened by the join tile
export function JoinForm() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const [id, setId] = useSafeInput('', ROOM_CODE_INPUT)
  const [recentRooms] = useState(getRecentRooms)

  const joinRoom = (room: string) => navigate(lobbyPath({ id: room, username: getUsername() }))

  const join: SubmitEventHandler = e => {
    e.preventDefault()
    if (id) joinRoom(id)
  }

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <form className="flex w-full max-w-110 flex-col gap-4" onSubmit={join}>
        <div className="flex items-center gap-3">
          <Field
            id="room-code"
            icon="icon-[mdi--gamepad-variant]"
            label="room code"
            autoComplete="off"
            autoFocus={!isTouch}
            value={id}
            onChange={e => setId(e.target.value)}
            className="flex-1"
          />
          <button
            type="submit"
            aria-label="join room"
            className={clsx('button icon success', { disabled: !id })}
            disabled={!id}
          >
            <span className="icon-[mdi--login]" />
          </button>
        </div>
        {recentRooms.length > 0 && (
          <>
            <Divider>recent rooms</Divider>
            <div className="grid grid-cols-3 gap-2">
              {recentRooms.map(room => (
                <button key={room} type="button" className="button" onClick={() => joinRoom(room)}>
                  {room}
                </button>
              ))}
            </div>
          </>
        )}
        <Link href="/room" aria-label="back" className="button icon large danger mt-4 self-center">
          <span className="icon-[mdi--chevron-left]" />
        </Link>
      </form>
    </a.div>
  )
}

// text between two lines
function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-white text-stroke-black">
      <hr className="flex-1 border-white/40" />
      {children}
      <hr className="flex-1 border-white/40" />
    </div>
  )
}
