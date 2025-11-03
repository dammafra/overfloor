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
        <div>
          <table>
            <thead>
              <tr>
                <th>room</th>
                <th>owner</th>
                <th># players</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.roomId}>
                  <td>{room.roomId}</td>
                  <td>{room.metadata?.owner || '-'}</td>
                  <td>{room.clients}</td>
                  <td>
                    <Link href={`/join/${room.roomId}`} className="button icon" title="Join">
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

      <Link href="/" className="button danger" title="Back">
        back
      </Link>
    </a.div>
  )
}
