import { v4 as uuid } from 'uuid'
import { Link } from 'wouter'

export function MainMenu() {
  return (
    <div className="page">
      <ul className="flex flex-col items-center gap-4">
        <li className="flex">
          <Link className="button" href="/new">
            Create Room
          </Link>
        </li>
        <li className="flex">
          <Link className="button" href="/join">
            Join Room
          </Link>
        </li>
        <li className="flex">
          <Link
            className="button warning"
            href={`/new/lobby/${btoa(JSON.stringify({ id: uuid(), username: uuid(), training: true, countdown: 3 }))}`}
          >
            Training
          </Link>
        </li>
      </ul>
    </div>
  )
}
