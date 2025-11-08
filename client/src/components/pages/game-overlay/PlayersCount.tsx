import { a, useSpring } from '@react-spring/web'
import { useGame } from '@stores'

export function PlayersCount() {
  const playersCount = useGame(s => s.playersCount)

  const spring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 20 },
  })

  return (
    playersCount > 0 && (
      <a.span
        style={spring}
        className="absolute top-4 left-4 bg-white/20 text-white text-stroke-black text-center text-2xl py-2 px-4 pl-12 rounded-xl"
      >
        <span className="icon-[mdi--users-group] absolute left-4 top-1/2 -translate-y-1/2"></span>
        {playersCount}
      </a.span>
    )
  )
}
