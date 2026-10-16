import { a, useTransition } from '@react-spring/web'
import { getRecentRooms, MAX_RECENT_ROOMS, POP_TRANSITION, type PopStyle } from '@utils'
import clsx from 'clsx'
import { useState } from 'react'
import { Field } from './Field'

const INPUT = 'input'
const SLOTS = Array.from({ length: MAX_RECENT_ROOMS }, (_, i) => i)
type Slot = typeof INPUT | number

interface RoomCodeFieldProps {
  value: string
  onChange: (code: string) => void
}

/**
 * Room code input, swapped with the recent rooms through the history button on its left,
 * which takes its space from them.
 * The input and the slots overlap while swapping, the slots popping one at a time.
 */
export function RoomCodeField({ value, onChange }: RoomCodeFieldProps) {
  const [recentRooms] = useState(getRecentRooms)
  const [history, setHistory] = useState(false)

  const slots = useTransition(history ? SLOTS : [INPUT], {
    ...POP_TRANSITION,
    keys: (slot: Slot) => slot,
    trail: 60,
  })

  const select = (room: string) => {
    onChange(room)
    setHistory(false)
  }

  return (
    <div className="flex items-center gap-3">
      {recentRooms.length > 0 && (
        <button
          type="button"
          className="button icon"
          aria-label={history ? 'close recent rooms' : 'recent rooms'}
          onClick={() => setHistory(!history)}
        >
          <span className={history ? 'icon-[mdi--close]' : 'icon-[mdi--history]'} />
        </button>
      )}

      <div className="relative h-10 flex-1">
        {slots((spring, slot) =>
          slot === INPUT ? (
            <Field
              id="room-code"
              icon="icon-[mdi--gamepad-variant]"
              label="room code"
              placeholder="empty for new room"
              autoComplete="off"
              value={value}
              onChange={e => onChange(e.target.value)}
              className="absolute inset-0"
              style={spring}
            />
          ) : (
            <RecentRoom
              key={slot}
              slot={slot}
              room={recentRooms[slot]}
              style={spring}
              onSelect={select}
            />
          ),
        )}
      </div>
    </div>
  )
}

interface RecentRoomProps {
  slot: number
  room?: string
  style: PopStyle
  onSelect: (room: string) => void
}

// a third of the row each, the empty ones disabled
function RecentRoom({ slot, room, style, onSelect }: RecentRoomProps) {
  return (
    <a.button
      type="button"
      className={clsx('button absolute inset-y-0', { disabled: !room })}
      style={{
        ...style,
        // the spring opacity overrides the one of `.disabled`
        opacity: style.opacity.to(o => (room ? o : o * 0.5)),
        left: `calc(${slot} * (100% + 0.5rem) / ${MAX_RECENT_ROOMS})`,
        width: `calc((100% - ${MAX_RECENT_ROOMS - 1} * 0.5rem) / ${MAX_RECENT_ROOMS})`,
      }}
      disabled={!room}
      onClick={() => room && onSelect(room)}
    >
      {room ?? '/'}
    </a.button>
  )
}
