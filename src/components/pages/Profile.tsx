import { Environment, Player } from '@components'
import { useFadeIn, useIsTouch, useUsernameInput } from '@hooks'
import { a } from '@react-spring/web'
import { Float } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { getStoredColor, saveProfile, usernameColor } from '@utils'
import clsx from 'clsx'
import { Suspense, useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'wouter'
import { Field } from './room-form/Field'

// username and character color, stored as they change
export function Profile() {
  const [, navigate] = useLocation()
  const isTouch = useIsTouch()
  // set when redirected from the room form, e.g. by a shared link
  const room = useSearchParams()[0].get('room')

  const [username, setUsername] = useUsernameInput()
  // none until picked: the color follows the username
  const [picked, setPicked] = useState(getStoredColor)
  const color = picked ?? usernameColor(username)

  useEffect(() => saveProfile({ username, color: picked }), [username, picked])

  const start = () => username && navigate(room ? `/room/${room}` : '/room')

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

        <div className="relative h-80 short:h-40">
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
            <Environment />
            <Suspense>
              <Float floatIntensity={2} rotationIntensity={1}>
                <Player position-y={-0.4} rotation-y={-0.4} scale={1.25} color={color} />
              </Float>
            </Suspense>
          </Canvas>

          <label className="button icon absolute top-2 right-2" style={{ background: color }}>
            <span className="icon-[mdi--palette] text-white" />
            <input
              type="color"
              aria-label="character color"
              className="absolute inset-0 opacity-0"
              value={color}
              onChange={e => setPicked(e.target.value)}
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
