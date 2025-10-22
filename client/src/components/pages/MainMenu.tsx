import { useDebug } from '@hooks'
import { Link } from 'wouter'

export function MainMenu() {
  const debug = useDebug()

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
        {debug && (
          <>
            <li className="flex">
              <Link
                className="button warning"
                href="/new/lobby/eyJpZCI6InRlc3QiLCJ1c2VybmFtZSI6InBsYXllciJ9"
              >
                <span className="icon-[mdi--flask]" /> Test
              </Link>
            </li>
            <li className="flex">
              <Link className="button warning" href="/test">
                <span className="icon-[mdi--flask]" /> Load Test
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  )
}
