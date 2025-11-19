import { useIsTouch, useRoom, useSafeInput } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import clsx from 'clsx'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'wouter'

export function JoinRoom() {
  const { id } = useParams()
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()

  const [username, setUsername] = useSafeInput(localStorage.getItem('overfloor-username') ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const client = useRoom()

  useEffect(() => localStorage.setItem('overfloor-username', username), [username])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!username || error) return

    setLoading(true)
    client.http
      .get(`/username-exists/${id}/${username}`)
      .then(res => {
        const exists = res.data
        if (exists) setError(true)
        else {
          const options = btoa(JSON.stringify({ id, username }))
          navigate(`/join/lobby/${options}`)
        }
      })
      .finally(() => setLoading(false))
  }

  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  })

  return (
    <a.div className="page" style={{ opacity }}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            autoFocus={!isTouch}
            className="input"
            placeholder="username"
            value={username}
            onChange={e => {
              setError(false)
              setUsername(e.target.value)
            }}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/join" state="join" className="button danger icon">
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
            {loading ? 'loading... ' : error ? 'Username already exists' : 'join room'}
          </button>
        </div>
      </form>
    </a.div>
  )
}
