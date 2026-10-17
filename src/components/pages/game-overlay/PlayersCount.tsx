import { usePopIn } from '@hooks'
import { a } from '@react-spring/web'
import { useRoomState } from '@stores'

export function PlayersCount() {
  const players = useRoomState(s => s.players)
  const playersCount = players.length

  const spring = usePopIn()

  return (
    playersCount > 0 && (
      <a.span
        style={spring}
        className="relative w-28 rounded-xl bg-white/20 px-4 py-2 pl-12 text-center text-2xl text-white backdrop-blur-xs text-stroke-black"
      >
        <span className="absolute top-1/2 left-4 icon-[mdi--users-group] -translate-y-1/2"></span>
        {playersCount}
      </a.span>
    )
  )
}
