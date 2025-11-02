import { a, useSpring } from '@react-spring/web'
import { clsx } from 'clsx'
import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()

  const [id, setId] = useState<string>('')
  const [username, setUsername] = useState<string>('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    const options = btoa(JSON.stringify({ id, username }))
    navigate(`/new/lobby/${options}`)
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
