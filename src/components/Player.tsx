import { animatable, FONT } from '@utils'
import { BlockCharacter, type BlockCharacterProps } from '@components/models'
import { a } from '@react-spring/three'
import { Billboard, Text } from '@react-three/drei'

export interface PlayerProps extends BlockCharacterProps {
  username?: string
  showIndicator?: boolean
  showUsername?: boolean
}

export const Player = animatable(
  ({
    username,
    color,
    pattern,
    patternColor,
    eyeColor,
    showIndicator,
    showUsername,
    animate,
    onStep,
    ...props
  }: PlayerProps) => {
    return (
      <a.group {...props}>
        <BlockCharacter
          color={color}
          pattern={pattern}
          patternColor={patternColor}
          eyeColor={eyeColor}
          animate={animate}
          onStep={onStep}
        />
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
