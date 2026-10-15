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
        className="absolute top-4 left-4 rounded-xl bg-white/20 px-4 py-2 pl-12 text-center text-2xl text-white backdrop-blur-xs text-stroke-black"
      >
        <span className="absolute top-1/2 left-4 icon-[mdi--users-group] -translate-y-1/2"></span>
        {playersCount}
      </a.span>
    )
  )
}
