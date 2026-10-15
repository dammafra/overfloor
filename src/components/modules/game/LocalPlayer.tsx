import { Player } from '@components'
import { useGamePhase, useThrottle } from '@hooks'
import { notifyFell } from '@multiplayer'
import { useFrame } from '@react-three/fiber'
import { quat, vec3, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER, type PlayerSchema } from '@schema'
import { useController, useRoomState } from '@stores'
import { myPlayer } from 'playroomkit'
import { useEffect, useRef, useState } from 'react'
import { Quaternion, Vector3 } from 'three'
import { Controller } from './Controller'
import { PlayerBody } from './PlayerBody'

const FALL_LIMIT = -50
const UP = new Vector3(0, 1, 0)

// reused every frame
const _impulse = new Vector3()
const _rotation = new Quaternion()

export function LocalPlayer() {
  const started = useGamePhase() === 'started'

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

    // read the controller here instead of subscribing, to avoid re-rendering on every key press
    const { up, down, left, right, strength } = useController.getState()
    setWalking(up || down || left || right)

    _impulse.set(Number(right) - Number(left), 0, Number(down) - Number(up))
    if (_impulse.lengthSq() === 0) return

    const safeDelta = Math.min(delta, 0.1)
    _impulse.normalize()

    // rotation toward direction, with smooth interpolation
    const angle = Math.atan2(_impulse.x, _impulse.z) // y-axis rotation
    _rotation.setFromAxisAngle(UP, angle)
    const rotation = quat(bodyRef.current.rotation()).slerp(_rotation, 5 * delta)

    bodyRef.current.applyImpulse(_impulse.multiplyScalar(strength * safeDelta), true)
    bodyRef.current.setRotation(rotation, true)
  })

  return (
    player && (
      <Controller>
        <PlayerBody
          key={player.spawn}
          ref={bodyRef}
          gravityScale={5}
          friction={0.5}
          linearDamping={0.4}
          position={player.position}
        >
          <Player username={player.username} animate={walking} showIndicator />
        </PlayerBody>
      </Controller>
    )
  )
}
