import type { PropsWithRoom } from '@hooks'
import { Html } from '@react-three/drei'
import type { GameLobbyState } from '@server/schema'
import clsx from 'clsx'
import { getStateCallbacks } from 'colyseus.js'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { Link, useParams } from 'wouter'

export function Countdown({ room }: PropsWithRoom<GameLobbyState>) {
  const { options } = useParams()
  const { id, username, training } = JSON.parse(atob(options!))

  const countdownRef = useRef<HTMLParagraphElement>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [canStart, setCanStart] = useState(false)

  useEffect(() => {
    if (!room) return
    const $ = getStateCallbacks(room)

    $(room.state).listen('owner', owner => setIsOwner(owner === username))

    $(room.state).listen('countdown', countdown => {
      if (!countdownRef.current) return
      countdownRef.current.textContent = countdown.toString()
    })

    $(room.state).listen('canStart', setCanStart)
  }, [room, username])

  const share = async () => {
    const url = `${location.protocol}//${location.host}/join/${id}`
    const toShare = {
      text: url,
    }

    navigator.clipboard.writeText(url)
    toast.info('Join URL copied to clipboard')

    if (navigator.canShare(toShare)) {
      await navigator.share(toShare)
    }
  }

  return (
    <Html
      center
      className="flex flex-col items-center justify-center size-44 aspect-square rounded-full text-center text-white font-bold bg-radial from-slate-400 to-70% to-transparent z-99"
    >
      <p>{canStart ? 'Match starts in...' : 'Waiting for opponents...'}</p>
      <p ref={countdownRef} className={clsx('text-7xl', !canStart && 'hidden')} />

      <div className="absolute bottom-0 flex gap-2">
        <Link href="/" className="button danger icon" title="Back">
          <span className="icon-[mdi--chevron-left]" />
        </Link>
        {isOwner && canStart && (
          <button className="button success icon" title="Start" onClick={() => room?.send('start')}>
            <span className="icon-[mdi--play]" />
          </button>
        )}
        {!training && (
          <button className="button icon" title="Share" onClick={share}>
            <span className="icon-[mdi--share]" />
          </button>
        )}
      </div>
    </Html>
  )
}
