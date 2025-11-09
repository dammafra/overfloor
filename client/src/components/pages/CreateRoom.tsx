import { useColyseus, useIsTouch, useSafeInput } from '@hooks'
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
  const client = useColyseus()

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
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            autoFocus={!isTouch}
            className="input"
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
            className="input"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/" className="button danger icon">
            <span className="icon-[mdi--chevron-left]" />
          </Link>
          <button
            type="submit"
            className={clsx('button flex-1 h-10', {
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
