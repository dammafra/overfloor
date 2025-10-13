import type { PropsWithRoom } from '@hooks'
import { Html } from '@react-three/drei'
import type { GameLobbyState } from '@server/schema'
import clsx from 'clsx'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useRef, useState } from 'react'

export function Countdown({ room }: PropsWithRoom<GameLobbyState>) {
  const countdownRef = useRef<HTMLParagraphElement>(null)
  const [canStart, setCanStart] = useState(false)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('countdown', countdown => {
      if (!countdownRef.current) return
      countdownRef.current.textContent = countdown.toString()
    })

    $(room.state).listen('canStart', setCanStart)
  }, [room])

  return (
    <Html
      center
      occlude="blending"
      className="flex flex-col items-center justify-center size-44 aspect-square rounded-full text-center text-white font-bold bg-radial from-slate-400 to-70% to-transparent"
    >
      <p>{canStart ? 'Match starts in...' : 'Waiting for opponents...'}</p>
      <p ref={countdownRef} className={clsx('text-7xl', !canStart && 'hidden')} />
    </Html>
  )
}
