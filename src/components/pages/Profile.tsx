import { useFadeIn, useIsTouch } from '@hooks'
import { a } from '@react-spring/web'
import { selectProfileColor, useProfile } from '@stores'
import { lobbyPath } from '@utils'
import clsx from 'clsx'
import { Link, useLocation, useParams } from 'wouter'
import { Field } from './room-form/Field'

// username and character color, the character itself in the 3D scene (see `ProfileCharacter`)
export function Profile() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()
  // set when redirected from the room form, e.g. by a shared link
  const { room } = useParams()

  const { username, setUsername, pickColor } = useProfile()
  const color = useProfile(selectProfileColor)

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

        {/* room for the character, its height mirrored by `ProfileCharacter` */}
        <div className="relative h-80 short:h-40">
          <label className="button icon absolute top-2 right-2" style={{ background: color }}>
            <span className="icon-[mdi--palette] text-white" />
            <input
              type="color"
              aria-label="character color"
              className="absolute inset-0 opacity-0"
              value={color}
              onChange={e => pickColor(e.target.value)}
            />
          </label>
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
