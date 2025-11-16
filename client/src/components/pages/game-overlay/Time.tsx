import { a, useSpring } from '@react-spring/web'
import { useGame } from '@stores'

export function Time() {
  const time = useGame(s => s.time)

  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const spring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 20 },
  })

  return (
    <a.span
      style={spring}
      className="backdrop-blur-xs absolute top-4 right-4 bg-white/20 text-white text-stroke-black text-2xl py-2 px-4 pl-12 rounded-xl"
    >
      <span className="icon-[mdi--clock-time-four] absolute left-4 top-1/2 -translate-y-1/2"></span>
      <p className="w-24 text-center">{format(time)}</p>
    </a.span>
  )
}
