import clsx from 'clsx'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'wouter'

export function JoinRoom() {
  const { id } = useParams()
  const [, navigate] = useLocation()
  const [username, setUsername] = useState<string>()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    const options = btoa(JSON.stringify({ id, username }))
    navigate(`/join/lobby/${options}`)
  }

  return (
    <div className="page">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            className="input"
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex gap-2">
          <Link href="/" className="button danger icon" title="Back">
            <span className="icon-[mdi--chevron-left]" />
          </Link>
          <button type="submit" className={clsx('button flex-1', { disabled: !id || !username })}>
            Join Room
          </button>
        </div>
      </form>
    </div>
  )
}
