import { useFadeIn, useIsTouch } from '@hooks'
import iro from '@jaames/iro'
import { a, useTransition } from '@react-spring/web'
import { selectProfileColor, useProfile, type ProfilePanel } from '@stores'
import {
  contrastColor,
  lobbyPath,
  PATTERN_REPEAT,
  patternUrl,
  PATTERNS_COUNT,
  POP_TRANSITION,
} from '@utils'
import clsx from 'clsx'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'wouter'
import { Field } from './room-form/Field'

// diamonds of the profile buttons, as in the menu grid: 36px apart (28px small, on short screens)
const SMALL = 'short:size-9 short:text-3xl'
const SQUARE = {
  top: `absolute top-0 left-9 short:left-7 ${SMALL}`,
  left: `absolute top-9 left-0 short:top-7 ${SMALL}`,
  right: `absolute top-9 left-18 short:top-7 short:left-14 ${SMALL}`,
  bottom: `absolute top-18 left-9 short:top-14 short:left-7 ${SMALL}`,
}

// side of the color wheel, its brightness slider below
const WHEEL_SIZE = 140

type ColorPanel = Exclude<ProfilePanel, 'patterns'>

// none first
const PATTERNS = [undefined, ...Array.from({ length: PATTERNS_COUNT }, (_, i) => i + 1)]

// username and character look, the character itself in the 3D scene (see `ProfileCharacter`)
export function Profile() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()
  // set when redirected from the room form, e.g. by a shared link
  const { room } = useParams()

  const {
    username,
    setUsername,
    pickColor,
    pattern,
    pickPattern,
    patternColor,
    pickPatternColor,
    eyeColor,
    pickEyeColor,
  } = useProfile()
  const color = useProfile(selectProfileColor)
  const panel = useProfile(s => s.panel)
  const setPanel = useProfile(s => s.setPanel)
  // the panels in place of the buttons
  const buttonsTransition = useTransition(!panel, POP_TRANSITION)
  const patternsTransition = useTransition(panel === 'patterns', POP_TRANSITION)
  const wheelTransition = useTransition(panel === 'patterns' ? undefined : panel, POP_TRANSITION)
  const colors: Record<ColorPanel, ColorWheelProps> = {
    color: { color, onPick: pickColor },
    patternColor: { color: patternColor, onPick: pickPatternColor },
    eyeColor: { color: eyeColor, onPick: pickEyeColor },
  }

  // closed again when leaving the page
  useEffect(() => () => setPanel(undefined), [setPanel])

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
        <div className="relative h-80 short:h-52">
          {/* a 2×2 square of the menu grid: color on top, pattern on the left, its color at the
              bottom, eyes on the right. Small on short screens */}
          {buttonsTransition(
            (spring, show) =>
              show && (
                <a.div style={spring} className="absolute top-2 left-2">
                  <ColorButton
                    label="character color"
                    className={SQUARE.top}
                    color={color}
                    onClick={() => setPanel('color')}
                  >
                    <span className="icon-[mdi--palette]" style={{ color: contrastColor(color) }} />
                  </ColorButton>

                  <button
                    type="button"
                    aria-label="character pattern"
                    className={clsx('button icon large overflow-hidden', SQUARE.left)}
                    onClick={() => setPanel('patterns')}
                  >
                    <PatternPreview
                      pattern={pattern}
                      color={color}
                      patternColor={patternColor}
                      upright
                    />
                  </button>

                  <ColorButton
                    label="pattern color"
                    className={clsx(SQUARE.bottom, { disabled: !pattern })}
                    color={patternColor}
                    onClick={() => setPanel('patternColor')}
                  >
                    <span
                      className={clsx(
                        'icon-[mdi--palette-outline]',
                        contrastColor(patternColor) === 'white'
                          ? 'text-white text-stroke-black'
                          : 'text-black',
                      )}
                    />
                  </ColorButton>

                  <ColorButton
                    label="eye color"
                    className={SQUARE.right}
                    color={eyeColor}
                    onClick={() => setPanel('eyeColor')}
                  >
                    <span className="icon-[mdi--eye]" style={{ color: contrastColor(eyeColor) }} />
                  </ColorButton>
                </a.div>
              ),
          )}

          {wheelTransition(
            (spring, colorPanel) =>
              colorPanel && (
                <a.div
                  style={spring}
                  // dragging on the wheel is not a drag of the character (see `ProfileCharacter`)
                  onPointerDown={e => e.stopPropagation()}
                  // in place of the buttons, as the patterns
                  className="absolute top-0 left-0 rounded-xl bg-white/30 p-2"
                >
                  <ColorWheel {...colors[colorPanel]} />
                  <CloseButton label="close color" onClick={() => setPanel(undefined)} />
                </a.div>
              ),
          )}

          {patternsTransition(
            (spring, open) =>
              open && (
                <a.div
                  style={spring}
                  // scrolling the grid is not a drag of the character (see `ProfileCharacter`)
                  onPointerDown={e => e.stopPropagation()}
                  // the whole left side, in place of the buttons
                  className="absolute inset-y-0 left-0 w-32 rounded-xl bg-white/30 p-1"
                >
                  {/* padded: the scroll clips the ring of the picked pattern otherwise */}
                  <div className="grid h-full auto-rows-max grid-cols-2 gap-2 overflow-y-auto p-1">
                    {PATTERNS.map(option => (
                      <button
                        key={option ?? 'none'}
                        type="button"
                        aria-label={option ? `pattern ${option}` : 'no pattern'}
                        className={clsx(
                          'relative aspect-square overflow-hidden rounded-xl shadow',
                          {
                            'ring-4 ring-amber-400': option === pattern,
                          },
                        )}
                        onClick={() => pickPattern(option)}
                      >
                        <PatternPreview
                          pattern={option}
                          color={color}
                          patternColor={patternColor}
                        />
                      </button>
                    ))}
                  </div>

                  <CloseButton label="close patterns" onClick={() => setPanel(undefined)} />
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

type CloseButtonProps = {
  label: string
  onClick: () => void
}

// on the top left corner of a side panel, out of it
function CloseButton({ label, onClick }: CloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="button icon danger absolute -top-3 -left-3"
      onClick={onClick}
    >
      <span className="icon-[mdi--close]" />
    </button>
  )
}

type ColorButtonProps = {
  label: string
  className: string
  color: string
  // opens the color wheel
  onClick: () => void
  // the icon
  children: ReactNode
}

// a diamond button in the given color
function ColorButton({ label, className, color, onClick, children }: ColorButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={clsx('button icon large', className)}
      style={{ background: color }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

type ColorWheelProps = {
  color: string
  onPick: (color: string) => void
}

// iro's color wheel and brightness slider, built once and kept on the given color
function ColorWheel({ color, onPick }: ColorWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<iro.ColorPicker>(null)
  // the wheel is built with the starting one, kept up to date below
  const [startColor] = useState(color)
  // the latest, without building the wheel again
  const onPickRef = useRef(onPick)

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    const container = containerRef.current!
    const picker = iro.ColorPicker(container, {
      width: WHEEL_SIZE,
      color: startColor,
      borderWidth: 2,
    })
    // by the user only, not when following the `color` prop
    picker.on('input:change', (picked: iro.Color) => onPickRef.current(picked.hexString))
    pickerRef.current = picker

    // no teardown in iro: its elements are just removed
    return () => container.replaceChildren()
  }, [startColor])

  useEffect(() => {
    const picker = pickerRef.current
    if (picker && picker.color.hexString !== color) picker.color.hexString = color
  }, [color])

  return <div ref={containerRef} />
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
