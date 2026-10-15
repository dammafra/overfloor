import { Text, type TextProps } from '@react-three/drei'
import type { ReactNode } from 'react'
import { FONT } from '@utils'
import { MathUtils } from 'three'

// text lying on the top face of a tile
export function TileLabel(props: Partial<TextProps> & { children: ReactNode }) {
  return (
    <Text
      font={FONT}
      textAlign="center"
      outlineWidth={0.01}
      position={[0, 0.13, 0]}
      rotation={[MathUtils.degToRad(-90), 0, MathUtils.degToRad(-90)]}
      {...props}
    />
  )
}
