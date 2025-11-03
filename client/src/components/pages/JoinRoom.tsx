import { useColyseus } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation, useParams } from 'wouter'

export function JoinRoom() {
  const { id } = useParams()
  const [, navigate] = useLocation()

  const [username, setUsername] = useState<string>('')
  const client = useColyseus()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    const options = { id, username }
    client
      .joinById(id!, options)
      .then(room => room.leave())
      .then(() => navigate(`/lobby/${btoa(JSON.stringify(options))}`))
      .catch(e => toast.error(e.message))
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
            className="input"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value.trim())}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2">
          <Link href="/" className="button danger" title="Back">
            back
          </Link>
          <button type="submit" className={clsx('button flex-1', { disabled: !id || !username })}>
            join room
          </button>
        </div>
      </form>
    </a.div>
  )
}
