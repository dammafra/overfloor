import { useSafeInput } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { clsx } from 'clsx'
import { useEffect, type SubmitEventHandler } from 'react'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()
  const [username, setUsername] = useSafeInput(localStorage.getItem('overfloor-username') ?? '')

  useEffect(() => localStorage.setItem('overfloor-username', username), [username])

  const onSubmit: SubmitEventHandler = e => {
    e.preventDefault()
    if (!username) return

    const options = btoa(JSON.stringify({ username }))
    navigate(`/new/lobby/${options}`)
  }

  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 500,
  })

  return (
    <a.div className="page" style={{ opacity }}>
      <form className="flex w-full max-w-110 flex-col gap-4" onSubmit={onSubmit}>
        <div>
          <input
            className="input w-full"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="button danger">
            back
          </Link>
          <button type="submit" className={clsx('button h-10 flex-1', { disabled: !username })}>
            create room
          </button>
        </div>
      </form>
    </a.div>
  )
}
