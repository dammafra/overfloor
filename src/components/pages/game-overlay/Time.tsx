import { usePopIn } from '@hooks'
import { a } from '@react-spring/web'
import { useRoomState } from '@stores'

export function Time() {
  const time = useRoomState(s => s.time)

  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const spring = usePopIn()

  return (
    <a.span
      style={spring}
      className="relative rounded-xl bg-white/20 px-4 py-2 pl-12 text-2xl text-white backdrop-blur-xs text-stroke-black"
    >
      <span className="absolute top-1/2 left-4 icon-[mdi--clock-time-four] -translate-y-1/2"></span>
      <p className="w-24 text-center">{format(time)}</p>
    </a.span>
  )
}
