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

  return (
    <div className="page">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            className="input"
            placeholder="Room ID"
            value={id}
            onChange={e => setId(e.target.value.trim())}
          />
          <span className="icon-[mdi--gamepad-variant]" />
        </div>
        <div>
          <input
            className="input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value.trim())}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2">
          <Link href="/" className="button danger icon" title="Back">
            <span className="icon-[mdi--chevron-left]" />
          </Link>
          <button type="submit" className={clsx('button flex-1', { disabled: !id || !username })}>
            Create Room
          </button>
        </div>
      </form>
    </div>
  )
}
