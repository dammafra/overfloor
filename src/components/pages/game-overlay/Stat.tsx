import { a, type SpringValues } from '@react-spring/web'
import clsx from 'clsx'
import type { ReactNode } from 'react'

type StatProps = {
  icon: string
  children: ReactNode
  className?: string
  style?: SpringValues<{ scale: number; opacity: number }>
}

// an icon in a square, a diamond as the icon buttons, its text against the bottom right side
export function Stat({ icon, children, className, style }: StatProps) {
  return (
    <a.div style={style} className={clsx('size-12 text-white text-stroke-black', className)}>
      <span className="flex size-full rotate-45 items-center justify-center rounded-xl bg-white/20 text-3xl backdrop-blur-xs">
        <span className={clsx(icon, '-rotate-45')} />
      </span>
      {/* from the middle of the side: 24px from the center of the 48px square across the diagonal,
          ~17px on each axis, and ~6px clear of it */}
      <span className="absolute top-9 left-12 text-xl leading-none whitespace-nowrap">
        {children}
      </span>
    </a.div>
  )
}
