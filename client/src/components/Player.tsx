import { BlockCharacter, type BlockCharacterProps } from '@components/models'
import { a } from '@react-spring/three'
import { Billboard, Text } from '@react-three/drei'
import { useMemo } from 'react'

function stringToColor(str: string) {
  // simple 32-bit hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // ensure 32-bit
  }

  // golden ratio conjugate (spreads hues evenly)
  const goldenRatio = 0.618033988749895

  // map hash to [0,1)
  const normalized = (Math.abs(hash) % 1000) / 1000

  // compute hue using golden ratio
  const h = ((normalized + goldenRatio) % 1) * 360

  // vary saturation and lightness based on hash
  const s = 65 + (Math.abs(hash) % 20) // 65–84%
  const l = 45 + ((Math.abs(hash) >> 8) % 15) // 45–59%

  return `hsl(${Math.round(h)}, ${s}%, ${l}%)`
}

export interface PlayerProps extends BlockCharacterProps {
  username?: string
  showIndicator?: boolean
  showUsername?: boolean
}

export const Player = a(
  ({ username, showIndicator, showUsername, animate, ...props }: PlayerProps) => {
    const color = useMemo(() => username && stringToColor(username), [username])

    return (
      <a.group {...props}>
        <BlockCharacter color={color} animate={animate} />
        {(showIndicator || showUsername) && (
          <Billboard position-y={showUsername ? 1.5 : 2.5} scale={showUsername ? 0.25 : 0.4}>
            <Text
              font="/fonts/audiowide.ttf"
              maxWidth={20}
              textAlign="center"
              fontSize={1.5}
              outlineWidth={0.1}
            >
              {showUsername ? username : 'YOU'}
            </Text>
            <mesh scale={[showUsername ? username!.length : 4, 0.5, 1]} position-y={-1.3}>
              <planeGeometry />
              <meshBasicMaterial color={color} />
            </mesh>
          </Billboard>
        )}
      </a.group>
    )
  },
)
