import { useLobby } from '@hooks'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function JoinOrCreateRoom() {
  const [, navigate] = useLocation()
  const [username, setUsername] = useState<string>()
  const { rooms } = useLobby()

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Link
        href="/"
        className="bg-slate-400 text-white font-bold rounded-2xl shadow hover:bg-slate-500 cursor-pointer flex items-center absolute top-4 left-4"
      >
        <span className="icon-[mdi--chevron-left] text-4xl" />
      </Link>

      <div className="flex flex-col gap-4">
        <input
          className="bg-white px-4 py-2 rounded-2xl relative"
          placeholder="Enter username..."
          onChange={e => setUsername(e.target.value)}
        />

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
                  <td className="py-2 py-4">
                    <button
                      type="submit"
                      className={`bg-slate-400 text-white font-bold px-4 py-2 rounded-2xl shadow hover:bg-slate-500 cursor-pointer flex items-center ${!username && 'opacity-20 pointer-events-none'}`}
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
