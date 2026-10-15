import { BallCollider, RigidBody, type RigidBodyProps } from '@react-three/rapier'

// physics body shared by simulated and synced players
export function PlayerBody({ children, ...props }: RigidBodyProps) {
  return (
    <RigidBody colliders={false} enabledRotations={[false, false, false]} {...props}>
      <BallCollider args={[0.6]} />
      {children}
    </RigidBody>
  )
}
