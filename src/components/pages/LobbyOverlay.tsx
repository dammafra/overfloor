import { useLobbyOptions, usePopIn } from '@hooks'
import { a, useTransition } from '@react-spring/web'
import { POP_TRANSITION } from '@utils'
import { useState } from 'react'
import { Link } from 'wouter'

export function LobbyOverlay() {
  const { id, practice, rematch } = useLobbyOptions() ?? {}
  const [info, setInfo] = useState(false)

  const share = async () => {
    if (!id) return
    const url = `${location.protocol}//${location.host}/room/${id}`
    const toShare = { text: url }

    await navigator.clipboard.writeText(url)
    setInfo(true)

    // Web Share API is missing on some desktop browsers (e.g. Firefox)
    if (navigator.canShare?.(toShare)) {
      await navigator.share(toShare)
    }
  }

  const spring = usePopIn()

  const transition = useTransition(info, {
    ...POP_TRANSITION,
    leave: { ...POP_TRANSITION.leave, delay: 3000 },
    onRest: () => setInfo(false),
  })

  if (practice) return null

  return (
    <a.div className="page pointer-events-none" style={spring}>
      <a.div className="pointer-events-auto absolute bottom-5 w-full text-center text-white text-stroke-black">
        <div className="relative mb-2 flex items-center justify-center gap-4">
          {transition(
            (spring, info) =>
              info && (
                <a.p
                  style={spring}
                  className="absolute -top-12 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-xs"
                >
                  URL copied to clipboard
                </a.p>
              ),
          )}
          <Link href="/" className="button icon danger">
            <span className="icon-[mdi--chevron-left]" />
          </Link>
          <p>leave / share</p>
          <button className="button icon" onClick={share}>
            <span className="icon-[mdi--share]" />
          </button>
        </div>

        <h1 className="line-clamp-1 px-4 text-4xl break-all md:text-5xl">
          {rematch ? 'REMATCH' : id || 'Loading...'}
        </h1>
      </a.div>
    </a.div>
  )
}
