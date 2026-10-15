import { useConfetti } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { useGame } from '@stores'
import clsx from 'clsx'
import type { SeatReservation } from 'colyseus.js'
import { Link, useLocation, useParams } from 'wouter'

export function Leaderboard() {
  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))
  // @ts-expect-error id and username are custom fields
  const { room: { roomId: id }, username } = reservation //oxfmt-ignore
  const [, navigate] = useLocation()

  const leaderboard = useGame(s => s.leaderboard)
  const winner = leaderboard.at(0) === username

  const rematch = async () => {
    const options = btoa(JSON.stringify({ id: `${id}-rematch`, username, rematch: true }))
    navigate(`/join/lobby/${options}`)
  }

  const burst = useConfetti()
  const webSpring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    onRest: () => (winner ? burst() : undefined),
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
