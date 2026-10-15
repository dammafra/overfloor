import { BallCollider, RigidBody, type RigidBodyProps } from '@react-three/rapier'

const GROUP = 0x0001 // category bit 1
const MASK = 0xffff ^ GROUP // collide with everything except itself
const PLAYERS_COLLISION_GROUP = (GROUP << 16) | MASK

// physics body shared by local and remote players
export function PlayerBody({ children, ...props }: RigidBodyProps) {
  return (
    <RigidBody
      colliders={false}
      enabledRotations={[false, false, false]}
      collisionGroups={PLAYERS_COLLISION_GROUP}
      {...props}
    >
      <BallCollider args={[0.6]} />
      {children}
    </RigidBody>
  )
}
