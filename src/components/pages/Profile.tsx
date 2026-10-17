import { useFadeIn, useIsTouch } from '@hooks'
import { a, useTransition } from '@react-spring/web'
import { selectProfileColor, useProfile } from '@stores'
import {
  contrastColor,
  lobbyPath,
  PATTERN_REPEAT,
  patternUrl,
  PATTERNS_COUNT,
  POP_TRANSITION,
} from '@utils'
import clsx from 'clsx'
import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'wouter'
import { Field } from './room-form/Field'

// none first
const PATTERNS = [undefined, ...Array.from({ length: PATTERNS_COUNT }, (_, i) => i + 1)]

// username and character look, the character itself in the 3D scene (see `ProfileCharacter`)
export function Profile() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()
  // set when redirected from the room form, e.g. by a shared link
  const { room } = useParams()

  const { username, setUsername, pickColor, pattern, pickPattern, patternColor, pickPatternColor } =
    useProfile()
  const color = useProfile(selectProfileColor)
  const patternsOpen = useProfile(s => s.patternsOpen)
  const setPatternsOpen = useProfile(s => s.setPatternsOpen)
  const patternsTransition = useTransition(patternsOpen, POP_TRANSITION)

  // closed again when leaving the page
  useEffect(() => () => setPatternsOpen(false), [setPatternsOpen])

  // straight to the lobby of the shared room, if any
  const start = () => username && navigate(room ? lobbyPath({ id: room, username }) : '/room')

  const { opacity } = useFadeIn(500)

  return (
    <a.div className="page" style={{ opacity }}>
      <div className="flex w-full max-w-110 flex-col gap-4">
        <Field
          id="username"
          icon="icon-[mdi--user]"
          label="username"
          autoFocus={!isTouch}
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && start()}
        />

        {/* room for the character, on the open profile tile (see `ProfileCharacter`) */}
        <div className="relative h-80 short:h-40">
          <div className="absolute top-2 left-2 flex flex-col gap-4">
            <label className="button icon" style={{ background: color }}>
              <span className="icon-[mdi--palette]" style={{ color: contrastColor(color) }} />
              <input
                type="color"
                aria-label="character color"
                className="absolute inset-0 opacity-0"
                value={color}
                onChange={e => pickColor(e.target.value)}
              />
            </label>

            <button
              type="button"
              aria-label="character pattern"
              className="button icon overflow-hidden"
              onClick={() => setPatternsOpen(!patternsOpen)}
            >
              <PatternPreview pattern={pattern} color={color} patternColor={patternColor} upright />
            </button>

            <label
              className={clsx('button icon', { disabled: !pattern })}
              style={{ background: patternColor }}
            >
              <span
                className={clsx(
                  'icon-[mdi--palette-outline]',
                  contrastColor(patternColor) === 'white'
                    ? 'text-white text-stroke-black'
                    : 'text-black',
                )}
              />
              <input
                type="color"
                aria-label="pattern color"
                className="absolute inset-0 opacity-0"
                value={patternColor}
                onChange={e => pickPatternColor(e.target.value)}
              />
            </label>
          </div>

          {patternsTransition(
            (spring, open) =>
              open && (
                <a.div
                  style={spring}
                  // scrolling the grid is not a drag of the character (see `ProfileCharacter`)
                  onPointerDown={e => e.stopPropagation()}
                  className="absolute inset-y-0 left-14 grid w-32 auto-rows-max grid-cols-2 gap-2 overflow-y-auto rounded-xl bg-white/30 p-2 short:w-48 short:grid-cols-3"
                >
                  {PATTERNS.map(option => (
                    <button
                      key={option ?? 'none'}
                      type="button"
                      aria-label={option ? `pattern ${option}` : 'no pattern'}
                      className={clsx('relative aspect-square overflow-hidden rounded-xl shadow', {
                        'ring-4 ring-amber-400': option === pattern,
                      })}
                      onClick={() => pickPattern(option)}
                    >
                      <PatternPreview pattern={option} color={color} patternColor={patternColor} />
                    </button>
                  ))}
                </a.div>
              ),
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/" className="button danger">
            go back
          </Link>
          <button
            type="button"
            className={clsx('button accent', { disabled: !username })}
            onClick={start}
          >
            start
          </button>
        </div>
      </div>
    </a.div>
  )
}

type PatternPreviewProps = {
  pattern?: number
  color: string
  patternColor: string
  // inside a diamond button: turned back straight, and bigger to fill its corners
  upright?: boolean
}

// the body color with the pattern on top, an icon when there's none
function PatternPreview({ pattern, color, patternColor, upright }: PatternPreviewProps) {
  return (
    <span
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: color }}
    >
      {pattern ? (
        <span
          className={clsx('absolute', upright ? '-inset-1/4 -rotate-45' : 'inset-0')}
          style={{
            background: patternColor,
            // the white of the pattern is shown
            maskImage: `url(${patternUrl(pattern)})`,
            maskMode: 'luminance',
            // as many repetitions as across a face of the character, over the visible preview
            // (the upright one overflows its button by a quarter on each side)
            maskSize: `${100 / PATTERN_REPEAT / (upright ? 1.5 : 1)}%`,
            // tiled from the middle, so the preview is centered on the pattern
            maskPosition: 'center',
          }}
        />
      ) : (
        <span className="icon-[mdi--cancel] text-2xl" style={{ color: contrastColor(color) }} />
      )}
    </span>
  )
}
