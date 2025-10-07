import { Link } from 'wouter'

export default function MainMenu() {
  return (
    <ul className="absolute inset-0 flex flex-col gap-4 items-center justify-center">
      <li className="flex">
        <Link
          className="bg-slate-400 text-white font-bold px-4 py-2 rounded-2xl shadow hover:bg-slate-500 cursor-pointer"
          href="/new"
        >
          Create Room
        </Link>
      </li>
      <li className="flex">
        <Link
          className="bg-slate-400 text-white font-bold px-4 py-2 rounded-2xl shadow hover:bg-slate-500 cursor-pointer"
          href="/join"
        >
          Join Room
        </Link>
      </li>
    </ul>
  )
}
