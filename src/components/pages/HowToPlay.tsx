import { useFadeIn, useIsTouch } from '@hooks'
import { a } from '@react-spring/web'
import { Link } from 'wouter'

export function HowToPlay() {
  const { opacity } = useFadeIn(500)
  const isTouch = useIsTouch()

  return (
    <a.div className="page text-white text-stroke-black" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col items-center gap-4 text-center">
        <p className="text-2xl text-balance">Stay on the floor and be the last one standing!</p>
        <hr className="w-50 border-white/40" />
        <p className="text-balance">
          Watch your step: <br /> tiles flash{' '}
          <span className="text-[limegreen] uppercase">green</span>,{' '}
          <span className="text-[orange] uppercase">orange</span>,{' '}
          <span className="text-[brown] uppercase">red</span>... <br />
          then drop! Don't be on them!
        </p>
        <p className="text-balance">Every round gets faster and the floor keeps shrinking.</p>
        <p className="text-balance">Running out of room? Shove your rivals off the edge!</p>
        <p className="text-balance">
          Move with {isTouch ? 'the on-screen joystick' : 'WASD or the arrow keys'},
        </p>
        <hr className="w-50 border-white/40" />
        <p className="text-balance">
          Not enough friends?
          <br /> Try the practice mode!
        </p>
        <Link href="/" className="button danger mt-4">
          go back
        </Link>
      </div>
    </a.div>
  )
}
