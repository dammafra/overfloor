import { useConfetti } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { useGame } from '@stores'
import clsx from 'clsx'
import { Link } from 'wouter'

export function Leaderboard() {
  const burst = useConfetti()

  const leaderboard = useGame(s => s.leaderboard)

  const webSpring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    onRest: burst,
  })

  return (
    <a.div
      style={webSpring}
      className="page gap-4 relative text-white text-stroke-black pointer-events-auto"
    >
      <h1 className="text-4xl bg-white/40 py-2 px-4 rounded-xl">LEADERBOARD</h1>

      <div className="flex justify-center items-center gap-4 relative z-10">
        <Link href="/" className="button danger icon">
          <span className="icon-[mdi--close]" />
        </Link>
        <p className="">leave / rematch</p>
        <Link href="/" className="button icon disabled">
          <span className="icon-[mdi--reload]" />
        </Link>
      </div>

      <ol className="list-decimal list-inside text-xl w-full max-w-80 h-80 overflow-scroll fade-vertical">
        {leaderboard.map((player, i) => (
          <li
            key={`leaderboard-player-${i}`}
            className={clsx(i === 0 && 'text-3xl text-amber-400')}
          >
            {player} {i === 0 && <span className="icon-[mdi--crown] float-right mt-1" />}
          </li>
        ))}
      </ol>
    </a.div>
  )
}
