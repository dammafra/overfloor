import { usePopIn } from '@hooks'
import { useRoomState } from '@stores'
import { Stat } from './Stat'

export function PlayersCount({ className }: { className?: string }) {
  const playersCount = useRoomState(s => s.players.length)

  const spring = usePopIn()

  return (
    playersCount > 0 && (
      <Stat icon="icon-[mdi--users-group]" style={spring} className={className}>
        {playersCount}
      </Stat>
    )
  )
}
