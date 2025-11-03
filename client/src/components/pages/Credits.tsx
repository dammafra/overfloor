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
    <a.div className="page text-center" style={{ opacity }}>
      <p className="text-white text-stroke-black text-2xl mb-4">
        Made with ♥︎ by{' '}
        <a className="underline" href="https://github.com/dammafra" target="_blank">
          @dammafra
        </a>
      </p>
      <p className="text-white text-stroke-black text-xl mb-4">
        Block Character by J-Toastie
        <br /> via{' '}
        <a className="underline" href="https://poly.pizza/m/ozSIyRIcIj" target="_blank">
          Poly Pizza
        </a>
        ,{' '}
        <a
          className="underline"
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
        >
          CC-BY
        </a>
      </p>
      <Link href="/" className="button danger mt-4">
        back
      </Link>
    </a.div>
  )
}
