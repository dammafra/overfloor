import { useColyseus, useSafeInput } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import clsx from 'clsx'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation, useParams } from 'wouter'

export function JoinRoom() {
  const { id } = useParams()
  const [, navigate] = useLocation()

  const [username, setUsername] = useSafeInput(localStorage.getItem('overfloor-username') ?? '')
  const [loading, setLoading] = useState(false)
  const client = useColyseus()

  useEffect(() => localStorage.setItem('overfloor-username', username), [username])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    setLoading(true)
    client.http
      .get(`/username-exists/${id}/${username}`)
      .then(res => {
        const exists = res.data
        if (exists) toast.error('Username already exists, choose a new one')
        else {
          const options = btoa(JSON.stringify({ id, username }))
          navigate(`/join/lobby/${options}`)
        }
      })
      .catch(e => toast.error(e.message))
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
            autoFocus
            className="input"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2">
          <Link href="/" className="button danger">
            back
          </Link>
          <button
            type="submit"
            className={clsx('button flex-1', { disabled: !id || !username || loading })}
          >
            {loading ? 'loading... ' : 'join room'}
          </button>
        </div>
      </form>
    </a.div>
  )
}
