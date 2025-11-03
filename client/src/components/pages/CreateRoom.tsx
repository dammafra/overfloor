import { useColyseus } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { clsx } from 'clsx'
import { useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()

  const [id, setId] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const client = useColyseus()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    const options = { id, username }
    client
      .create('game-lobby', options)
      .then(room => room.leave())
      .then(() => navigate(`/lobby/${btoa(JSON.stringify(options))}`))
      .catch(e => toast.error(e.message))
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
            onChange={e => setId(e.target.value.trim())}
          />
          <span className="icon-[mdi--gamepad-variant]" />
        </div>
        <div>
          <input
            className="input"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value.trim())}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/" className="button danger" title="Back">
            back
          </Link>
          <button type="submit" className={clsx('button flex-1', { disabled: !id || !username })}>
            create room
          </button>
        </div>
      </form>
    </a.div>
  )
}
