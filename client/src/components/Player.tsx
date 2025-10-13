import { BlockCharacter, type BlockCharacterProps } from '@components/models'
import { Html } from '@react-three/drei'
import { useMemo } from 'react'

function stringToHslColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = hash % 360
  return `hsl(${h}, ${70}%, ${50}%)`
}

interface PlayerProps extends BlockCharacterProps {
  name?: string
}

export function Player({ name, animate, ...props }: PlayerProps) {
  const color = useMemo(() => name && stringToHslColor(name), [name])

  return (
    <>
      <BlockCharacter color={color} animate={animate} {...props} />(
      <Html
        transform
        position-y={1}
        className="text-white rounded-full px-2 text-center whitespace-nowrap opacity-50"
        style={{ background: color?.toString() }}
      >
        {name}
      </Html>
      )
    </>
  )
}
