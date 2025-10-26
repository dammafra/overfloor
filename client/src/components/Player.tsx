import { BlockCharacter, type BlockCharacterProps } from '@components/models'
import { Billboard, Html } from '@react-three/drei'
import { useMemo } from 'react'

function stringToHslColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const h = ((hash % 360) + 360) % 360
  return `hsl(${h}, ${70}%, ${50}%)`
}

interface PlayerProps extends BlockCharacterProps {
  username?: string
  showIndicator?: boolean
}

export function Player({ username, showIndicator, animate, ...props }: PlayerProps) {
  const color = useMemo(() => username && stringToHslColor(username), [username])

  return (
    <>
      <BlockCharacter color={color} animate={animate} {...props} />(
      {showIndicator && (
        <Billboard position-y={2.5} scale={1.5}>
          <Html
            transform
            className="text-white text-stroke-black text-lg px-1 text-center font-extrabold whitespace-nowrap border-b-6 h-8"
            style={{ borderColor: color }}
          >
            YOU
          </Html>
        </Billboard>
      )}
      )
    </>
  )
}
