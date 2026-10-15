import { Player } from '@components'
import { useGamePhase, useThrottle } from '@hooks'
import { notifyFell } from '@multiplayer'
import { useFrame } from '@react-three/fiber'
import { BallCollider, quat, RigidBody, vec3, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER, type PlayerSchema } from '@schema'
import { useController, useRoomState } from '@stores'
import { myPlayer } from 'playroomkit'
import { useEffect, useRef, useState } from 'react'
import { Quaternion, Vector3 } from 'three'
import { Controller } from './Controller'

const GROUP = 0x0001 // category bit 1
const MASK = 0xffff ^ GROUP // collide with everything except itself
export const PLAYERS_COLLISION_GROUP = (GROUP << 16) | MASK

const FALL_LIMIT = -50

export function LocalPlayer() {
  const started = useGamePhase() === 'started'
  const { up, down, left, right, strength } = useController()

  const bodyRef = useRef<RapierRigidBody>(null)
  const fellRef = useRef(false)

  const players = useRoomState(s => s.players)
  const me = players.find(p => p.id === myPlayer()?.id)
  const [player, setPlayer] = useState<PlayerSchema>()
  const [walking, setWalking] = useState(false)

  const sendWalking = useThrottle((walking: boolean) => myPlayer()?.setState(PLAYER.walking, walking, true)) //oxfmt-ignore
  const sendMovement = useThrottle(() => {
    if (!bodyRef.current || bodyRef.current.isSleeping()) return
    myPlayer()?.setState(PLAYER.position, vec3(bodyRef.current.translation()).toArray(), false)
    myPlayer()?.setState(PLAYER.rotation, quat(bodyRef.current.rotation()).toArray(), false)
  }, 50)

  // (re)spawn when the host adds this player to the match
  if (me && me.spawn !== player?.spawn) setPlayer(me)

  useEffect(() => {
    if (!player) return
    fellRef.current = false
    myPlayer().setState(PLAYER.position, player.position, true)
  }, [player])

  useEffect(() => sendWalking(walking), [walking, sendWalking])

  useFrame((_, delta) => {
    if (!bodyRef.current) return

    if (!fellRef.current && bodyRef.current.translation().y < FALL_LIMIT) {
      fellRef.current = true
      notifyFell()
    }

    if (!fellRef.current) sendMovement()

    if (!started) return
    setWalking(up || down || left || right)

    const impulse = new Vector3()
    if (up) impulse.z -= 1
    if (down) impulse.z += 1
    if (right) impulse.x += 1
    if (left) impulse.x -= 1

    const safeDelta = Math.min(delta, 0.1)
    const impulseStrength = strength * safeDelta
    impulse.normalize().multiplyScalar(impulseStrength)

    if (impulse.equals(new Vector3())) return

    bodyRef.current.applyImpulse(impulse, true)

    // rotation toward direction
    const target = impulse.clone().normalize()
    const angle = Math.atan2(target.x, target.z) // y-axis rotation
    const current = quat(bodyRef.current.rotation())
    const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle)

    // smooth interpolation
    const lerped = new Quaternion().slerpQuaternions(current, q, 5 * delta)
    bodyRef.current.setRotation(lerped, true)
  })

  return (
    player && (
      <Controller>
        <RigidBody
          key={player.spawn}
          ref={bodyRef}
          colliders={false}
          gravityScale={5}
          friction={0.5}
          linearDamping={0.4}
          enabledRotations={[false, false, false]}
          position={player.position}
          collisionGroups={PLAYERS_COLLISION_GROUP}
        >
          <BallCollider args={[0.6]} />
          <Player username={player.username} animate={walking} showIndicator />
        </RigidBody>
      </Controller>
    )
  )
}
