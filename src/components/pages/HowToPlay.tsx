import { useFadeIn, useIsTouch } from '@hooks'
import { a } from '@react-spring/web'
import { Link } from 'wouter'

export function HowToPlay() {
  const { opacity } = useFadeIn(500)
  const isTouch = useIsTouch()

  return (
    <a.div className="page text-white text-stroke-black" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col items-center gap-4 text-center short:max-w-full">
        <p className="text-2xl text-balance">Stay on the floor and be the last one standing!</p>
        <hr className="w-50 border-white/40" />
        <div className="flex flex-col items-center gap-4 short:flex-row short:gap-12">
          <div className="contents flex-col gap-4 short:flex">
            <p>
              Watch your step: <br /> tiles flash{' '}
              <span className="text-[limegreen] uppercase">green</span>,{' '}
              <span className="text-[orange] uppercase">orange</span>,{' '}
              <span className="text-[brown] uppercase">red</span>... <br />
              then drop! Don't be on them!
            </p>
            <p className="order-last">
              Move with {isTouch ? 'the on-screen joystick' : 'WASD or the arrow keys'}.
            </p>
          </div>
          <div className="contents flex-col gap-4 short:flex">
            <p>
              Every round gets faster and <br /> the floor keeps shrinking.
            </p>
            <p>
              Running out of room? <br /> Shove your rivals off the edge!
            </p>
          </div>
        </div>
        <hr className="w-50 border-white/40" />
        <p>
          Not enough friends?
          <br className="short:hidden" /> Try the practice mode!
        </p>
        <Link href="/" className="button danger mt-4">
          go back
        </Link>
      </div>
    </a.div>
  )
}
