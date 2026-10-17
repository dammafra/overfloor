import { usePopIn } from '@hooks'
import { useRoomState } from '@stores'
import { Stat } from './Stat'

const format = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function Time({ className }: { className?: string }) {
  const time = useRoomState(s => s.time)

  const spring = usePopIn()

  return (
    <Stat icon="icon-[mdi--clock-time-four]" style={spring} className={className}>
      {format(time)}
    </Stat>
  )
}
