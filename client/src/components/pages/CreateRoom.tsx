import { useColyseus } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { clsx } from 'clsx'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()

  const [id, setId] = useState<string>('')
  const [username, setUsername] = useState<string>(localStorage.getItem('overfloor-username') ?? '')
  const [loading, setLoading] = useState(false)
  const client = useColyseus()

  useEffect(() => {
    {
      const safeId = id.replace(/\s+/g, '')
      setId(safeId)
    }
  }, [id])

  useEffect(() => {
    {
      const safeUsername = username.replace(/\s+/g, '')
      setUsername(safeUsername)
      localStorage.setItem('overfloor-username', safeUsername)
    }
  }, [username])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    setLoading(true)
    client.http
      .get(`/room-exists/${id}`)
      .then(res => {
        const exists = res.data
        if (exists) toast.error('Room already exists, join it or pick another ID')
        else {
          const options = btoa(JSON.stringify({ id, username }))
          navigate(`/new/lobby/${options}`)
        }
      })
      .catch(e => toast.error(e.message))
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
            className="input"
            placeholder="room ID"
            value={id}
            onChange={e => setId(e.target.value)}
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
          <Link href="/" className="button danger">
            back
          </Link>
          <button
            type="submit"
            className={clsx('button flex-1', { disabled: !id || !username || loading })}
          >
            {loading ? 'loading... ' : 'create room'}
          </button>
        </div>
      </form>
    </a.div>
  )
}
