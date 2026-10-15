import { useConfetti, useLeaderboard, usePopIn } from '@hooks'
import { a, config } from '@react-spring/web'
import { lobbyPath } from '@utils'
import clsx from 'clsx'
import { getRoomCode } from 'playroomkit'
import { Link, useLocation } from 'wouter'

export function Leaderboard() {
  const [, navigate] = useLocation()

  const { username, leaderboard, winner } = useLeaderboard()

  const rematch = () => {
    if (!username) return
    navigate(lobbyPath({ id: getRoomCode()!, username, rematch: true }))
  }

  const burst = useConfetti()
  const webSpring = usePopIn({
    config: config.default,
    onRest: () => winner && burst(),
  })

  return (
    <a.div
      style={webSpring}
      className="page pointer-events-auto relative gap-4 text-white text-stroke-black"
    >
      <h1 className="w-xs rounded-xl bg-white/40 px-4 py-2 text-center text-4xl">
        {winner ? 'YOU WIN' : 'GAME OVER'}
      </h1>

      <div className="relative z-10 flex items-center justify-center gap-4">
        <Link href="/" className="button icon danger">
          <span className="icon-[mdi--close]" />
        </Link>
        <p className="">leave / rematch</p>
        <button className="button icon" onClick={rematch}>
          <span className="icon-[mdi--reload]" />
        </button>
      </div>

      <ol className="fade-vertical h-80 w-full max-w-80 list-inside list-decimal overflow-scroll text-xl">
        {leaderboard.map((player, i) => (
          <li
            key={`leaderboard-player-${i}`}
            className={clsx({
              'text-3xl text-amber-400': i === 0,
              'text-rose-700': player === username && i > 0,
            })}
          >
            {player} {i === 0 && <span className="float-right mt-1 icon-[mdi--crown]" />}
          </li>
        ))}
      </ol>
    </a.div>
  )
}
