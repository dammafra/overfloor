import { Player, type PlayerProps } from '@components'
import { useGamePhase, useThrottle } from '@hooks'
import { ackInput, getRtt, reportFell, useIsHost } from '@multiplayer'
import { useTransition } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { quat, vec3, type CollisionEnterPayload, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER, type PlayerBodySchema, type PlayerSchema } from '@schema'
import { useRoomState } from '@stores'
import { animatable } from '@utils'
import { myPlayer, usePlayersList, type PlayerState } from 'playroomkit'
import { useEffect, useRef, useState } from 'react'
import { Quaternion, Vector3, type Vector3Tuple, type Vector4Tuple } from 'three'
import { PlayerBody } from './PlayerBody'

const FALL_LIMIT = -50
// walking: the horizontal velocity is steered toward the input, quickly so it doesn't feel like ice
const SPEED = 7
const ACCELERATION = 15
const DECELERATION = 20
const UP = new Vector3(0, 1, 0)
const IDENTITY: Vector4Tuple = [0, 0, 0, 1]
const ZERO: Vector3Tuple = [0, 0, 0]
const PUBLISH_INTERVAL = 33 //ms
const FOLLOW_RATE = 20
// the others are shown where they likely are now: published body moved along its velocity, up to a limit
const MAX_EXTRAPOLATION = 150 //ms
// own player prediction: the error from the host is recovered smoothly, at once when too large
const CORRECTION_RATE = 10
const SNAP_DISTANCE = 2
const HISTORY_DURATION = 1000 //ms
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
const _correction = new Vector3()

/**
 * Players of the match. The host simulates them all from their input (see `Controller`) and
 * publishes their bodies. The other clients predict their own player from the local input,
 * corrected toward the published body, and follow the others.
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
  const mode = host ? 'simulated' : props.player.id === myPlayer()?.id ? 'predicted' : 'synced'
  // a new body on (re)spawn, and when the mode changes (e.g. host migration)
  const key = `${props.player.spawn}-${mode}`
  if (mode === 'simulated') return <SimulatedPlayer key={key} {...props} />
  if (mode === 'predicted') return <PredictedPlayer key={key} {...props} />
  return <SyncedPlayer key={key} {...props} />
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

// read by the other bodies on contact
type PlayerUserData = { player: true; stunnedUntil: number; velocity: Vector3 }

function usePlayerUserData() {
  const [userData] = useState<PlayerUserData>(() => ({
    player: true,
    stunnedUntil: 0,
    velocity: new Vector3(),
  }))
  return userData
}

// turns and walks the body toward the input, the same on the host and in the prediction
function steer(body: RapierRigidBody, angle: number | null, stunned: boolean, delta: number) {
  const safeDelta = Math.min(delta, 0.1)

  if (angle != null) {
    // rotation toward direction, with smooth interpolation
    _rotation.setFromAxisAngle(UP, angle)
    body.setRotation(quat(body.rotation()).slerp(_rotation, 5 * safeDelta), true)
  }

  if (stunned) return

  const velocity = body.linvel()
  if (angle != null) _velocity.set(Math.sin(angle) * SPEED, 0, Math.cos(angle) * SPEED)
  else if (Math.hypot(velocity.x, velocity.z) < 0.01) return // already still: let it sleep
  else _velocity.set(0, 0, 0)

  // horizontal only, gravity keeps the vertical
  const t = Math.min(1, (angle != null ? ACCELERATION : DECELERATION) * safeDelta)
  _velocity.set(
    velocity.x + (_velocity.x - velocity.x) * t,
    velocity.y,
    velocity.z + (_velocity.z - velocity.z) * t,
  )
  body.setLinvel(_velocity, true)
}

// knockback of `target` pushed by `pusher` moving at `velocity`
function bump(
  pusher: RapierRigidBody,
  target: RapierRigidBody,
  data: PlayerUserData,
  velocity: Vector3,
) {
  // horizontal direction from the pusher to the target
  _bump.copy(target.translation()).sub(pusher.translation()).setY(0)
  if (_bump.lengthSq() === 0) return
  _bump.normalize()

  const speed = Math.max(0, velocity.dot(_bump))
  target.applyImpulse(_bump.multiplyScalar(BUMP + KNOCKBACK * speed), true)
  data.stunnedUntil = performance.now() + STUN
}

function otherPlayer({ other }: CollisionEnterPayload) {
  const data = other.rigidBody?.userData as PlayerUserData | undefined
  return other.rigidBody && data?.player ? { body: other.rigidBody, data } : undefined
}

const physicsProps = { gravityScale: 5, friction: 0.5, linearDamping: 0.4 }

// host side: dynamic body moved by the player input
function SimulatedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const fellRef = useRef(false)
  const userData = usePlayerUserData()
  const { started, walking } = useWalking(state)
  const initial = useInitialPosition(props)

  const publish = useThrottle((reliable: boolean) => {
    if (!bodyRef.current) return
    const body: PlayerBodySchema = {
      spawn: player.spawn,
      position: vec3(bodyRef.current.translation()).toArray(),
      rotation: quat(bodyRef.current.rotation()).toArray() as Vector4Tuple,
      velocity: vec3(bodyRef.current.linvel()).toArray(),
      ack: state.getState(PLAYER.inputSeq),
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
    // velocity before the step: on contact the solver has already stopped the body
    userData.velocity.copy(body.linvel())

    const angle: number | null = state.getState(PLAYER.input)
    steer(body, started ? angle : null, performance.now() < userData.stunnedUntil, delta)
  })

  return (
    <PlayerBody
      ref={bodyRef}
      {...physicsProps}
      position={initial}
      userData={userData}
      onCollisionEnter={payload => {
        const other = otherPlayer(payload)
        if (bodyRef.current && other)
          bump(bodyRef.current, other.body, other.data, userData.velocity)
      }}
    >
      <Player {...playerProps} animate={walking} />
    </PlayerBody>
  )
}

type HistoryEntry = { time: number; position: Vector3 }

// predicted position at `time`, interpolated between the recorded frames
function positionAt(history: HistoryEntry[], time: number, target: Vector3) {
  const next = history.findIndex(entry => entry.time >= time)
  if (next === -1) return target.copy(history[history.length - 1].position)
  if (next === 0) return target.copy(history[0].position)

  const a = history[next - 1]
  const b = history[next]
  return target.lerpVectors(a.position, b.position, (time - a.time) / (b.time - a.time))
}

// non-host own player: dynamic body moved by the local input right away. The published body
// shows where the host had the player about a round trip ago: compared with the predicted
// position back then, the difference (e.g. a bump missed locally) is recovered over time
function PredictedPlayer(props: MatchPlayerProps) {
  const { state, ...rest } = props
  const { player: _, ...playerProps } = rest

  const bodyRef = useRef<RapierRigidBody>(null)
  const historyRef = useRef<HistoryEntry[]>([])
  const publishedRef = useRef<PlayerBodySchema>(undefined)
  const errorRef = useRef(new Vector3())
  const userData = usePlayerUserData()
  const { started, walking } = useWalking(state)
  const initial = useInitialPosition(props)

  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body) return

    const now = performance.now()
    const history = historyRef.current
    const published = publishedBody(props)

    if (published && published !== publishedRef.current && history.length) {
      publishedRef.current = published
      ackInput(published.ack)
      // the host publishes on average half an interval after applying the input
      positionAt(history, now - getRtt() + PUBLISH_INTERVAL / 2, _correction)
      errorRef.current.fromArray(published.position).sub(_correction)
    }

    const error = errorRef.current
    if (error.lengthSq() > 0) {
      const t =
        error.length() > SNAP_DISTANCE ? 1 : Math.min(1, CORRECTION_RATE * Math.min(delta, 0.1))
      _correction.copy(error).multiplyScalar(t)
      error.sub(_correction)
      body.setTranslation(vec3(body.translation()).add(_correction), true)
      // the past predictions are corrected too, or the next comparison would count it again
      history.forEach(entry => entry.position.add(_correction))
    }

    userData.velocity.copy(body.linvel())

    const angle: number | null = state.getState(PLAYER.input)
    steer(body, started ? angle : null, now < userData.stunnedUntil, delta)

    history.push({ time: now, position: vec3(body.translation()) })
    while (history[0].time < now - HISTORY_DURATION) history.shift()
  })

  return (
    <PlayerBody
      ref={bodyRef}
      {...physicsProps}
      position={initial}
      userData={userData}
      onCollisionEnter={payload => {
        // the bump received by the host, predicted: the other one is bumped by the host only
        const other = otherPlayer(payload)
        if (bodyRef.current && other)
          bump(other.body, bodyRef.current, userData, other.data.velocity)
      }}
    >
      <Player {...playerProps} animate={walking} />
    </PlayerBody>
  )
}

// other clients: kinematic body following the published one, moved along its velocity
function SyncedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const publishedRef = useRef<PlayerBodySchema>(undefined)
  const receivedAtRef = useRef(0)
  const userData = usePlayerUserData()
  const { walking } = useWalking(state)
  const initial = useInitialPosition(props)

  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body) return

    const now = performance.now()
    const published = publishedBody(props)
    if (published !== publishedRef.current) {
      publishedRef.current = published
      receivedAtRef.current = now
    }

    // published about half a round trip ago, plus the time since it arrived
    const extrapolation = Math.min(MAX_EXTRAPOLATION, getRtt() / 2 + now - receivedAtRef.current)
    userData.velocity.fromArray(published?.velocity ?? ZERO)
    _targetPosition
      .fromArray(published?.position ?? player.position)
      .addScaledVector(userData.velocity, extrapolation / 1000)
    _targetRotation.fromArray(published?.rotation ?? IDENTITY)

    const safeDelta = Math.min(delta, 0.1)
    const position = vec3(body.translation()).lerp(_targetPosition, FOLLOW_RATE * safeDelta)
    const rotation = quat(body.rotation()).slerp(_targetRotation, FOLLOW_RATE * safeDelta)

    body.setNextKinematicTranslation(position)
    body.setNextKinematicRotation(rotation)
  })

  return (
    <PlayerBody ref={bodyRef} type="kinematicPosition" position={initial} userData={userData}>
      <Player {...playerProps} animate={walking} />
    </PlayerBody>
  )
}
