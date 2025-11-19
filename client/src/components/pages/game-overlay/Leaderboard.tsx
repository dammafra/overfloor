import { useConfetti, useRoom } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { useGame } from '@stores'
import clsx from 'clsx'
import type { SeatReservation } from 'colyseus.js'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'

export function Leaderboard() {
  const params = useParams()
  const reservation: SeatReservation = JSON.parse(atob(params.reservation!))
  // @ts-expect-error id and username are custom fields
  const { id, username } = reservation
  const [, navigate] = useLocation()

  const leaderboard = useGame(s => s.leaderboard)
  const winner = leaderboard.at(0) === username
  const [loading, setLoading] = useState(false)

  const client = useRoom()

  const rematch = async () => {
    setLoading(true)
    client.http
      .get(`/room-exists/${id}`)
      .then(res => {
        const exists = res.data
        const options = btoa(JSON.stringify({ id, username }))
        navigate(`/${exists ? 'join' : 'new'}/lobby/${options}`)
      })
      .finally(() => setLoading(false))
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
      className="page gap-4 relative text-white text-stroke-black pointer-events-auto"
    >
      <h1 className="w-xs text-4xl text-center bg-white/40 py-2 px-4 rounded-xl">
        {winner ? 'YOU WIN' : 'GAME OVER'}
      </h1>

      <div className="flex justify-center items-center gap-4 relative z-10">
        <Link href="/" className="button danger icon">
          <span className="icon-[mdi--close]" />
        </Link>
        <p className="">leave / rematch</p>
        <button className={clsx('button icon', { disabled: loading })} onClick={rematch}>
          {loading ? (
            <span className="icon-[codex--loader]" />
          ) : (
            <span className="icon-[mdi--reload]" />
          )}
        </button>
      </div>

      <ol className="list-decimal list-inside text-xl w-full max-w-80 h-80 overflow-scroll fade-vertical">
        {leaderboard.map((player, i) => (
          <li
            key={`leaderboard-player-${i}`}
            className={clsx({
              'text-3xl text-amber-400': i === 0,
              'text-rose-700': player === username && i > 0,
            })}
          >
            {player} {i === 0 && <span className="icon-[mdi--crown] float-right mt-1" />}
          </li>
        ))}
      </ol>
    </a.div>
  )
}
