import { useLobby } from '@hooks'
import { a, useSpring } from '@react-spring/web'
import { useEffect } from 'react'
import { Link, useLocation } from 'wouter'

export function ChooseRoom() {
  const [, navigate] = useLocation()
  const { rooms, error, loading } = useLobby({ filter: { name: 'game-lobby' } })

  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: history.state ? 0 : 500,
  })

  useEffect(() => {
    if (!error) return
    navigate('/')
  }, [error, navigate])

  return (
    <a.div className="page" style={{ opacity }}>
      {rooms.length ? (
        <div className="fade-vertical h-80 w-full max-w-110 overflow-scroll">
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
                <tr key={room.roomId} onClick={() => navigate(`/join/${room.roomId}`)}>
                  <td className="max-w-1">
                    <p className="overflow-hidden text-ellipsis">{room.roomId}</p>
                    <p className="flex items-center gap-1 text-xs">
                      <span className="icon-[mdi--user] shrink-0 text-sm" />
                      <span className="overflow-hidden text-ellipsis">
                        {room.metadata?.owner || '-'}
                      </span>
                    </p>
                  </td>
                  <td className="w-30 text-center text-xl">{room.clients}</td>
                  <td className="w-1">
                    <button className="button icon">
                      <span className="icon-[mdi--chevron-right]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-4 text-center text-2xl text-white italic text-stroke-black">
          {loading ? 'loading...' : 'no rooms available'}
        </p>
      )}

      <Link href="/" className="button danger z-10 mt-4">
        back
      </Link>
    </a.div>
  )
}
