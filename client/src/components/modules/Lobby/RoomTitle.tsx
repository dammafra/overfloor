import { a, useSpring } from '@react-spring/web'
import { Html } from '@react-three/drei'
import clsx from 'clsx'
import { toast } from 'react-toastify'
import { Link, useParams } from 'wouter'

export function RoomTitle() {
  const { options } = useParams()
  const { id, training } = JSON.parse(atob(options!))

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

  const spring = useSpring({
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  })

  return (
    <Html center className="absolute inset-0" wrapperClass="fixed inset-0">
      <a.div
        className="absolute bottom-5 w-full text-white text-stroke-black text-center"
        style={spring}
      >
        <div className="flex justify-center items-center gap-4 mb-2">
          <Link href="/" className="button danger icon">
            <span className="icon-[mdi--chevron-left]" />
          </Link>
          <p>leave / share</p>
          <button className={clsx('button icon', training && 'disabled')} onClick={() => share()}>
            <span className="icon-[mdi--share]" />
          </button>
        </div>

        <h1 className="text-5xl px-4">{training ? 'TRAINING' : id}</h1>
      </a.div>
    </Html>
  )
}
