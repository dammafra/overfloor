import { a } from '@react-spring/web'
import type { PopStyle } from '@utils'
import type { ComponentProps } from 'react'

type FieldProps = Omit<ComponentProps<'input'>, 'className' | 'style'> & {
  id: string
  icon: string
  label: string
  // of the wrapper, e.g. to animate it
  className?: string
  style?: PopStyle
}

// input with an icon on the left and its label inside, on the right
export function Field({ id, icon, label, className, style, ...props }: FieldProps) {
  return (
    <a.div className={className} style={style}>
      <input id={id} className="input w-full" {...props} />
      <span className={icon} />
      <label htmlFor={id} className="input-label">
        {label}
      </label>
    </a.div>
  )
}
