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
      <Link href="/" className="button icon absolute top-4 left-4">
        <span className="icon-[mdi--chevron-left]" />
      </Link>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            className="input"
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <button type="submit" className={clsx('button', { disabled: !id || !username })}>
          Join Room
        </button>
      </form>
    </div>
  )
}
