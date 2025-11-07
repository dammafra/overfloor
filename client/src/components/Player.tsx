import { BlockCharacter, type BlockCharacterProps } from '@components/models'
import { Billboard, Text } from '@react-three/drei'
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
  showUsername?: boolean
}

export function Player({ username, showIndicator, showUsername, animate, ...props }: PlayerProps) {
  const color = useMemo(() => username && stringToHslColor(username), [username])

  return (
    <>
      <BlockCharacter color={color} animate={animate} {...props} />
      {(showIndicator || showUsername) && (
        <Billboard position-y={showUsername ? 1.5 : 2.5} scale={showUsername ? 0.25 : 0.4}>
          <Text
            font="/fonts/audiowide.ttf"
            overflowWrap="break-word"
            maxWidth={20}
            anchorY="bottom"
            textAlign="center"
            fontSize={1.5}
            outlineWidth={0.1}
          >
            {showUsername ? username : 'YOU'}
          </Text>
          <mesh
            scale={[showUsername ? Math.min(username!.length, 20) : 4, 0.5, 1]}
            position-y={-1.3}
          >
            <planeGeometry />
            <meshBasicMaterial color={color} />
          </mesh>
        </Billboard>
      )}
    </>
  )
}
