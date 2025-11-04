import { a, useSpring } from '@react-spring/web'
import { Link } from 'wouter'

// TODO
export function Credits() {
  const { opacity } = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 500,
  })

  return (
    <a.div className="page text-center text-white text-stroke-black" style={{ opacity }}>
      {/* prettier-ignore */}
      <p className="text-2xl mb-4">Made with ♥︎ by <a className="underline" href="https://github.com/dammafra" target="_blank">@dammafra</a></p>
      {/* prettier-ignore */}
      <p className="text-lg mb-4">
        <a className="uppercase" href="https://poly.pizza/m/ozSIyRIcIj" target="_blank">Block Character</a> by <span className="uppercase">J-Toastie</span>
        <br /> via Poly Pizza [<a className="underline" href="https://creativecommons.org/licenses/by/3.0/" target="_blank">CC-BY</a>]
      </p>
      {/* prettier-ignore */}
      <p><a href="https://kenney.nl/assets/cursor-pack" target="_blank" className="uppercase">Cursor Pack</a> by <span className="uppercase">Kenney</span></p>
      <Link href="/" className="button danger mt-4">
        back
      </Link>
    </a.div>
  )
}
