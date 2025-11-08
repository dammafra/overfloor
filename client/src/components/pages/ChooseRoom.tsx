import { useLobby } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { Link, useLocation } from 'wouter'

export function ChooseRoom() {
  const [, navigate] = useLocation()
  const { rooms, error, loading } = useLobby({ filter: { name: 'game-lobby' } })

  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 500,
  })

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
    navigate('/')
  }, [error, navigate])

  return (
    <a.div className="page" style={{ opacity }}>
      {rooms.length ? (
        <div className="w-full max-w-110">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">room</th>
                <th># players</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.roomId}>
                  <td>
                    <p className="line-clamp-1">{room.roomId}</p>
                    <p className="flex items-center gap-1 text-xs">
                      <span className="icon-[mdi--crown] shrink-0" />
                      <span className="line-clamp-1">{room.metadata?.owner || '-'}</span>
                    </p>
                  </td>
                  <td className="text-center text-xl w-30">{room.clients}</td>
                  <td className="w-1">
                    <Link href={`/join/${room.roomId}`} className="button icon">
                      <span className="icon-[mdi--chevron-right]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white text-stroke-black text-center italic text-2xl mb-4">
          {loading ? 'loading...' : 'no rooms available'}
        </p>
      )}

      <Link href="/" className="button danger">
        back
      </Link>
    </a.div>
  )
}
