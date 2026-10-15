import { useIsTouch, useRoom, useSafeInput } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { clsx } from 'clsx'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const [id, setId] = useSafeInput()
  const [username, setUsername] = useSafeInput(localStorage.getItem('overfloor-username') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const client = useRoom()

  useEffect(() => localStorage.setItem('overfloor-username', username), [username])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id || error) return

    setLoading(true)
    client.http
      .get(`/room-exists/${id}`)
      .then(res => {
        const exists = res.data
        if (exists) setError(true)
        else {
          const options = btoa(JSON.stringify({ id, username }))
          navigate(`/new/lobby/${options}`)
        }
      })
      .finally(() => setLoading(false))
  }

  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 500,
  })

  return (
    <a.div className="page" style={{ opacity }}>
      <form className="flex w-full max-w-110 flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            autoFocus={!isTouch}
            className="input w-full"
            placeholder="room ID"
            value={id}
            onChange={e => {
              setError(false)
              setId(e.target.value)
            }}
          />
          <span className="icon-[mdi--gamepad-variant]" />
        </div>
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
          <button
            type="submit"
            className={clsx('button h-10 flex-1', {
              disabled: !id || !username || loading,
              danger: error,
              'text-sm': error,
            })}
          >
            {loading ? 'loading... ' : error ? 'Room already exists' : 'create room'}
          </button>
        </div>
      </form>
    </a.div>
  )
}
