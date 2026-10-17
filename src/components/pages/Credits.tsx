import { useFadeIn } from '@hooks'
import { a } from '@react-spring/web'
import { Link } from 'wouter'

export function Credits() {
  const { opacity } = useFadeIn(500)

  return (
    <a.div
      className="page flex flex-col gap-4 text-center text-white text-stroke-black"
      style={{ opacity }}
    >
      <p className="text-2xl">
        Made with ♥︎ by <br />
        <a className="underline" href="https://dammafra.dev" target="_blank">
          @dammafra
        </a>
      </p>
      <hr className="w-50 border-white/40" />
      <p>
        <a href="https://poly.pizza/m/ozSIyRIcIj" target="_blank">
          Block Character
        </a>
        <br />
        by J-Toastie{' '}
        <a
          className="text-xs underline"
          href="https://creativecommons.org/licenses/by/3.0/"
          target="_blank"
        >
          [CC-BY]
        </a>
      </p>
      <p>
        <a href="https://kenney.nl/assets/cursor-pack" target="_blank">
          Cursor
        </a>{' '}
        and{' '}
        <a href="https://kenney.nl/assets/pattern-pack" target="_blank">
          Pattern
        </a>{' '}
        Packs
        <br /> by Kenney
      </p>
      <p>
        SFX from{' '}
        <a href="https://pixabay.com/playlists/overfloor-30738504" target="_blank">
          Pixabay
        </a>
      </p>
      <Link href="/" className="button danger mt-4">
        go back
      </Link>
    </a.div>
  )
}
