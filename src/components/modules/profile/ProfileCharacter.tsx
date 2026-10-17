import { Player } from '@components'
import { a, useSpring } from '@react-spring/three'
import { Billboard, Float, PresentationControls } from '@react-three/drei'
import { selectProfileColor, useProfile } from '@stores'
import { MathUtils } from 'three'

// the character on the profile tile, always facing the camera, bigger in the middle of the tile once open
export function ProfileCharacter({ open }: { open: boolean }) {
  const color = useProfile(selectProfileColor)
  const pattern = useProfile(s => s.pattern)
  const patternColor = useProfile(s => s.patternColor)
  const eyeColor = useProfile(s => s.eyeColor)
  const panel = useProfile(s => s.panel)

  const spring = useSpring({
    // above the label when closed
    positionX: open ? 0 : 0.15,
    // a bit right of the side panel
    positionZ: open && panel ? 0.12 : 0,
    scale: open ? 0.15 : 0.28,
  })

  return (
    // undoes the diagonal of the tile, as seen by the menu camera
    <group rotation-y={MathUtils.degToRad(-45)}>
      <a.group
        position-x={spring.positionX}
        position-y={0.3}
        position-z={spring.positionZ}
        scale={spring.scale}
      >
        <Billboard>
          <Float floatIntensity={2} rotationIntensity={1}>
            {/* turned in every direction by dragging anywhere, back to the front once closed.
              Listening on the body: the profile page covers the canvas */}
            <PresentationControls
              key={String(open)}
              enabled={open}
              global
              domElement={document.body}
              cursor={false}
              speed={2}
              polar={[-Infinity, Infinity]}
            >
              <Player
                position-y={-0.4}
                rotation-y={-0.4}
                scale={1.25}
                color={color}
                pattern={pattern}
                patternColor={patternColor}
                eyeColor={eyeColor}
              />
            </PresentationControls>
          </Float>
        </Billboard>
      </a.group>
    </group>
  )
}
