import type { ComponentProps } from 'react'

type FieldProps = Omit<ComponentProps<'input'>, 'className'> & {
  id: string
  icon: string
  label: string
  // of the wrapper
  className?: string
}

// input with an icon on the left and its label inside, on the right
export function Field({ id, icon, label, className, ...props }: FieldProps) {
  return (
    <div className={className}>
      <input id={id} className="input w-full" {...props} />
      <span className={icon} />
      <label htmlFor={id} className="input-label">
        {label}
      </label>
    </div>
  )
}
