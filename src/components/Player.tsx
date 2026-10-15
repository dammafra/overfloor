import { animatable, FONT } from '@utils'
import { BlockCharacter, type BlockCharacterProps } from '@components/models'
import { a } from '@react-spring/three'
import { Billboard, Text } from '@react-three/drei'

function stringToColor(str: string) {
  // simple 32-bit hash
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // ensure 32-bit
  }

  // avalanche (murmur3 finalizer): similar strings, e.g. "Bot 1" and "Bot 2", get distant hues
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  hash >>>= 0

  const h = (hash / 2 ** 32) * 360
  const s = 65 + (hash % 20) // 65–84%
  const l = 45 + ((hash >>> 8) % 15) // 45–59%

  return `hsl(${Math.round(h)}, ${s}%, ${l}%)`
}

export interface PlayerProps extends BlockCharacterProps {
  username?: string
  showIndicator?: boolean
  showUsername?: boolean
}

export const Player = animatable(
  ({ username, showIndicator, showUsername, animate, ...props }: PlayerProps) => {
    const color = username && stringToColor(username)

    return (
      <a.group {...props}>
        <BlockCharacter color={color} animate={animate} />
        {(showIndicator || showUsername) && (
          <Billboard position-y={showUsername ? 1.5 : 2.5} scale={showUsername ? 0.25 : 0.4}>
            <Text font={FONT} maxWidth={20} textAlign="center" fontSize={1.5} outlineWidth={0.1}>
              {showUsername ? username : 'YOU'}
            </Text>
            <mesh scale={[showUsername ? (username?.length ?? 0) : 4, 0.5, 1]} position-y={-1.3}>
              <planeGeometry />
              <meshBasicMaterial color={color} />
            </mesh>
          </Billboard>
        )}
      </a.group>
    )
  },
)
