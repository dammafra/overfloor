import { Player, type PlayerProps } from '@components'
import { useGamePhase, useThrottle } from '@hooks'
import { reportFell, useIsHost } from '@multiplayer'
import { useTransition } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { quat, vec3, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER, type PlayerBodySchema, type PlayerSchema } from '@schema'
import { useRoomState } from '@stores'
import { animatable } from '@utils'
import { myPlayer, usePlayersList, type PlayerState } from 'playroomkit'
import { useEffect, useRef, useState } from 'react'
import { Quaternion, Vector3, type Vector4Tuple } from 'three'
import { PlayerBody } from './PlayerBody'

const FALL_LIMIT = -50
// walking: the horizontal velocity is steered toward the input, quickly so it doesn't feel like ice
const SPEED = 7
const ACCELERATION = 15
const DECELERATION = 20
const UP = new Vector3(0, 1, 0)
const IDENTITY: Vector4Tuple = [0, 0, 0, 1]
const PUBLISH_INTERVAL = 33 //ms
const FOLLOW_RATE = 20
// knockback on contact between players: a base bump plus the speed of the pusher toward the other
const BUMP = 1.5
const KNOCKBACK = 0.6
// time without control after a bump, so the knockback isn't cancelled by the walking
const STUN = 350 //ms

// reused every frame
const _velocity = new Vector3()
const _bump = new Vector3()
const _rotation = new Quaternion()
const _targetPosition = new Vector3()
const _targetRotation = new Quaternion()

/**
 * Players of the match. The host simulates them all from their input (see `Controller`) and
 * publishes their bodies, the other clients interpolate toward the published bodies.
 */
export function Players() {
  const players = useRoomState(s => s.players)
  const participants = usePlayersList()
  const host = useIsHost()

  const transition = useTransition(players, {
    keys: player => player.id,
    from: { scale: 0 },
    enter: { scale: 1 },
    leave: { scale: 0 },
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return transition((spring, player) => {
    const state = participants.find(p => p.id === player.id)
    return (
      state && (
        <MatchPlayer
          player={player}
          state={state}
          host={host}
          username={player.username}
          showIndicator={player.id === myPlayer()?.id}
          {...spring}
        />
      )
    )
  })
}

type MatchPlayerProps = PlayerProps & {
  player: PlayerSchema
  state: PlayerState
}

// the transition overrides the key of the elements it renders: the body is keyed here instead
const MatchPlayer = animatable(({ host, ...props }: MatchPlayerProps & { host: boolean }) => {
  // a new body on (re)spawn, and when switching between simulating and following
  const key = `${props.player.spawn}-${host}`
  return host ? <SimulatedPlayer key={key} {...props} /> : <SyncedPlayer key={key} {...props} />
})

// last published body of the player, if it belongs to the current spawn
function publishedBody({ player, state }: MatchPlayerProps) {
  const body: PlayerBodySchema | undefined = state.getState(PLAYER.body)
  return body?.spawn === player.spawn ? body : undefined
}

// resume from the published body (e.g. after host migration), from the spawn point otherwise
function useInitialPosition(props: MatchPlayerProps) {
  const [initial] = useState(() => publishedBody(props)?.position ?? props.player.position)
  return initial
}

function useWalking(state: PlayerState) {
  const started = useGamePhase() === 'started'
  const [walking, setWalking] = useState(false)

  useFrame(() => setWalking(started && state.getState(PLAYER.input) != null))

  return { started, walking }
}

// host side: dynamic body moved by the player input
type SimulatedUserData = { player: true; stunnedUntil: number }

function SimulatedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const fellRef = useRef(false)
  // velocity before the step: on contact the solver has already stopped the body
  const velocityRef = useRef(new Vector3())
  // read by the other bodies on contact
  const [userData] = useState<SimulatedUserData>(() => ({ player: true, stunnedUntil: 0 }))
  const { started, walking } = useWalking(state)
  const initial = useInitialPosition(props)

  const publish = useThrottle((reliable: boolean) => {
    if (!bodyRef.current) return
    const body: PlayerBodySchema = {
      spawn: player.spawn,
      position: vec3(bodyRef.current.translation()).toArray(),
      rotation: quat(bodyRef.current.rotation()).toArray() as Vector4Tuple,
    }
    state.setState(PLAYER.body, body, reliable)
  }, PUBLISH_INTERVAL)

  useEffect(() => publish(true), [publish])

  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body || fellRef.current) return

    if (body.translation().y < FALL_LIMIT) {
      fellRef.current = true
      reportFell(player.id)
      return
    }

    if (!body.isSleeping()) publish(false)
    velocityRef.current.copy(body.linvel())

    const angle: number | null = state.getState(PLAYER.input)
    const moving = started && angle != null
    const safeDelta = Math.min(delta, 0.1)

    if (moving) {
      // rotation toward direction, with smooth interpolation
      _rotation.setFromAxisAngle(UP, angle)
      body.setRotation(quat(body.rotation()).slerp(_rotation, 5 * delta), true)
    }

    if (performance.now() < userData.stunnedUntil) return

    const velocity = body.linvel()
    if (moving) _velocity.set(Math.sin(angle) * SPEED, 0, Math.cos(angle) * SPEED)
    else if (Math.hypot(velocity.x, velocity.z) < 0.01) return // already still: let it sleep
    else _velocity.set(0, 0, 0)

    // horizontal only, gravity keeps the vertical
    const t = Math.min(1, (moving ? ACCELERATION : DECELERATION) * safeDelta)
    _velocity.set(
      velocity.x + (_velocity.x - velocity.x) * t,
      velocity.y,
      velocity.z + (_velocity.z - velocity.z) * t,
    )
    body.setLinvel(_velocity, true)
  })

  return (
    <PlayerBody
      ref={bodyRef}
      gravityScale={5}
      friction={0.5}
      linearDamping={0.4}
      position={initial}
      userData={userData}
      onCollisionEnter={({ other }) => {
        const body = bodyRef.current
        const otherData = other.rigidBody?.userData as SimulatedUserData | undefined
        if (!body || !other.rigidBody || !otherData?.player) return

        // horizontal direction from this player to the other
        _bump.copy(other.rigidBody.translation()).sub(body.translation()).setY(0)
        if (_bump.lengthSq() === 0) return
        _bump.normalize()

        const speed = Math.max(0, velocityRef.current.dot(_bump))
        other.rigidBody.applyImpulse(_bump.multiplyScalar(BUMP + KNOCKBACK * speed), true)
        otherData.stunnedUntil = performance.now() + STUN
      }}
    >
      <Player {...playerProps} animate={walking} />
    </PlayerBody>
  )
}

// other clients: kinematic body following the published one.
// The own player turns toward the local input right away, without waiting for the host
function SyncedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const angleRef = useRef<number>(undefined)
  const { walking } = useWalking(state)
  const initial = useInitialPosition(props)

  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body) return

    const published = publishedBody(props)
    _targetPosition.fromArray(published?.position ?? player.position)
    _targetRotation.fromArray(published?.rotation ?? IDENTITY)

    if (player.id === myPlayer()?.id) {
      // the last direction is kept when idle, while the host is still turning toward it
      const angle: number | null = state.getState(PLAYER.input)
      if (angle != null) angleRef.current = angle
      if (angleRef.current != null) _targetRotation.setFromAxisAngle(UP, angleRef.current)
    }

    const safeDelta = Math.min(delta, 0.1)
    const position = vec3(body.translation()).lerp(_targetPosition, FOLLOW_RATE * safeDelta)
    const rotation = quat(body.rotation()).slerp(_targetRotation, FOLLOW_RATE * safeDelta)

    body.setNextKinematicTranslation(position)
    body.setNextKinematicRotation(rotation)
  })

  return (
    <PlayerBody ref={bodyRef} type="kinematicPosition" position={initial}>
      <Player {...playerProps} animate={walking} />
    </PlayerBody>
  )
}
