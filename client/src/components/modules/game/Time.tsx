import type { PropsWithRoom } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { Html } from '@react-three/drei'
import type { GameState } from '@schema'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useState } from 'react'

export function Time({ room }: PropsWithRoom<GameState>) {
  const [time, setTime] = useState<number>(0)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('time', setTime)
  }, [room])

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
    <Html
      center
      wrapperClass="fixed inset-0 pointer-events-none"
      className="absolute inset-0 pointer-events-none"
    >
      <a.span
        style={spring}
        className="absolute top-4 right-4 bg-white/20 text-white text-stroke-black text-2xl py-2 px-4 pl-12 rounded-xl"
      >
        <span className="icon-[mdi--clock-time-four] absolute left-4 top-1/2 -translate-y-1/2"></span>
        <p className="w-24 text-center">{format(time)}</p>
      </a.span>
    </Html>
  )
}
