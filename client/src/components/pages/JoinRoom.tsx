import { useLobby } from '@hooks'
import clsx from 'clsx'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function JoinOrCreateRoom() {
  const [, navigate] = useLocation()
  const [username, setUsername] = useState<string>()
  const { rooms } = useLobby({ filter: { name: 'game-lobby' } })

  return (
    <div className="page">
      <Link href="/" className="button icon absolute top-4 left-4">
        <span className="icon-[mdi--chevron-left]" />
      </Link>

      <div className="flex flex-col gap-4">
        <div>
          <input
            className="input"
            placeholder="Enter username..."
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user]" />
        </div>

        {rooms.length ? (
          <table className="text-white max-h-48 w-full">
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
                    <button
                      type="submit"
                      className={clsx('button icon', { disabled: !username })}
                      onClick={() => {
                        const options = btoa(JSON.stringify({ id: room.roomId, username }))
                        navigate(`/join/lobby/${options}`)
                      }}
                    >
                      <span className="icon-[mdi--arrow-right]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-white text-center italic">No rooms available</p>
        )}
      </div>
    </div>
  )
}
