import { useLobby } from '@hooks'
import { Link } from 'wouter'

export function ChooseRoom() {
  const { rooms } = useLobby({ filter: { name: 'game-lobby' } })

  return (
    <div className="page">
      {rooms.length ? (
        <table className="text-white max-h-48">
          <thead className="bg-slate-500">
            <tr>
              <th className="rounded-l-2xl py-2 px-4">Room</th>
              <th className="py-2 px-4">Players</th>
              <th className="rounded-r-2xl py-2 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.roomId}>
                <td className="py-2 px-4">{room.roomId}</td>
                <td className="py-2 px-4">{room.clients}</td>
                <td className="py-2">
                  <Link href={`/join/${room.roomId}`} className="button icon" title="Join">
                    <span className="icon-[mdi--arrow-right]" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-white text-center italic">No rooms available</p>
      )}

      <Link href="/" className="button danger icon mt-4" title="Back">
        <span className="icon-[mdi--chevron-left]" />
      </Link>
    </div>
  )
}
