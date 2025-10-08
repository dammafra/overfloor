import { Link } from 'wouter'

export function MainMenu() {
  return (
    <div className="container">
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
      </ul>
    </div>
  )
}
