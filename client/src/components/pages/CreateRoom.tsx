import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'wouter'

export function CreateRoom() {
  const [, navigate] = useLocation()

  const [id, setId] = useState<string>()
  const [username, setUsername] = useState<string>()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!id) return

    const options = btoa(JSON.stringify({ id, username }))
    navigate(`/new/lobby/${options}`)
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Link
        href="/"
        className="bg-slate-400 text-white font-bold rounded-2xl shadow hover:bg-slate-500 cursor-pointer flex items-center absolute top-4 left-4"
      >
        <span className="icon-[mdi--chevron-left] text-4xl" />
      </Link>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="relative">
          <input
            className="bg-white px-4 py-2 pl-10 rounded-2xl relative"
            placeholder="Room ID"
            onChange={e => setId(e.target.value)}
          />
          <span className="icon-[mdi--gamepad-variant] absolute text-2xl text-slate-500 left-2 top-2" />
        </div>
        <div className="relative">
          <input
            className="bg-white px-4 py-2 pl-10 rounded-2xl relative"
            placeholder="Username"
            onChange={e => setUsername(e.target.value)}
          />
          <span className="icon-[mdi--user] absolute text-2xl text-slate-500 left-2 top-2" />
        </div>
        <button
          type="submit"
          className={`bg-slate-400 text-white font-bold px-4 py-2 rounded-2xl shadow hover:bg-slate-500 cursor-pointer ${(!id || !username) && 'opacity-20 pointer-events-none'}`}
        >
          Create Room
        </button>
      </form>
    </div>
  )
}
