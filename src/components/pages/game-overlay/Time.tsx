import { useRoomState } from '@stores'
import { a, useSpring } from '@react-spring/web'

export function Time() {
  const time = useRoomState(s => s.time)

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
      className="absolute top-4 right-4 rounded-xl bg-white/20 px-4 py-2 pl-12 text-2xl text-white backdrop-blur-xs text-stroke-black"
    >
      <span className="absolute top-1/2 left-4 icon-[mdi--clock-time-four] -translate-y-1/2"></span>
      <p className="w-24 text-center">{format(time)}</p>
    </a.span>
  )
}
