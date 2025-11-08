import { a, useSpring, useTransition } from '@react-spring/web'
import clsx from 'clsx'
import { useState } from 'react'
import { Link, useParams } from 'wouter'

export function LobbyOverlay() {
  const { options } = useParams()
  const { id, training } = JSON.parse(atob(options!))
  const [info, setInfo] = useState(false)

  const share = async () => {
    const url = `${location.protocol}//${location.host}/join/${id}`
    const toShare = { text: url }

    navigator.clipboard.writeText(url)
    setInfo(true)

    if (navigator.canShare(toShare)) {
      await navigator.share(toShare)
    }
  }

  const spring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 20 },
  })

  const transition = useTransition(info, {
    from: { scale: 0, opacity: 0 },
    enter: { scale: 1, opacity: 1 },
    leave: { scale: 0, opacity: 0, delay: 3000 },
    config: { tension: 300, friction: 20 },
    onRest: () => setInfo(false),
  })

  return (
    <a.div className="page pointer-events-none" style={spring}>
      <a.div className="absolute bottom-5 w-full text-white text-stroke-black text-center pointer-events-auto">
        <div className="flex justify-center items-center gap-4 mb-2 relative">
          {transition(
            (spring, info) =>
              info && (
                <a.p style={spring} className="absolute -top-12 bg-white/20 px-4 py-2 rounded-xl">
                  URL copied to clipboard
                </a.p>
              ),
          )}
          <Link href="/" className="button danger icon">
            <span className="icon-[mdi--chevron-left]" />
          </Link>
          <p>leave / share</p>
          <button className={clsx('button icon', { disabled: training })} onClick={() => share()}>
            <span className="icon-[mdi--share]" />
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl px-4 break-all line-clamp-1">
          {training ? 'TRAINING' : id}
        </h1>
      </a.div>
    </a.div>
  )
}
