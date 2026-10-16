import { Player, type PlayerProps } from '@components'
import { useGamePhase } from '@hooks'
import { reportFell, useIsHost } from '@multiplayer'
import { useTransition } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { vec3, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER, type PlayerBodySchema, type PlayerSchema } from '@schema'
import { useRoomState } from '@stores'
import { animatable } from '@utils'
import { myPlayer, usePlayersList, type PlayerState } from 'playroomkit'
import { useRef, useState } from 'react'
import { Quaternion, Vector3, type Group } from 'three'
import { PlayerBody } from './PlayerBody'

const FALL_LIMIT = -50
// walking: an impulse toward the joystick every frame, against a strong damping.
// The players push each other through the physics contacts alone
const SPEED = 7
// horizontal only, so the falls keep the speed of gravity
const DAMPING = 12
// turning toward the joystick, smooth also when it snaps (keyboard)
const TURN_RATE = 5
const UP = new Vector3(0, 1, 0)

// reused every frame
const _rotation = new Quaternion()

/**
 * Players of the match. The host simulates them all from their joystick (see `Controller`) and
 * publishes their positions every frame, the other clients set them as they are.
 * Every client turns the players toward their joystick angle.
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
          color={player.color}
          pattern={player.pattern}
          patternColor={player.patternColor}
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

// joystick angle while it's pressed, synced by Playroom
function joystickAngle(state: PlayerState): number | null {
  return state.getState(PLAYER.joystick) ? (state.getState(PLAYER.angle) ?? 0) : null
}

// walking animation, and the character turned toward the joystick
function useJoystick(state: PlayerState) {
  const started = useGamePhase() === 'started'
  const characterRef = useRef<Group>(null)
  const [walking, setWalking] = useState(false)

  useFrame((_, delta) => {
    const angle = started ? joystickAngle(state) : null
    setWalking(angle != null)

    const character = characterRef.current
    if (angle == null || !character) return
    _rotation.setFromAxisAngle(UP, angle)
    character.quaternion.slerp(_rotation, Math.min(1, TURN_RATE * delta))
  })

  return { started, walking, characterRef }
}

// host side: dynamic body moved by the player input
function SimulatedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const fellRef = useRef(false)
  const { started, walking, characterRef } = useJoystick(state)
  const initial = useInitialPosition(props)

  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body || fellRef.current) return

    if (body.translation().y < FALL_LIMIT) {
      fellRef.current = true
      reportFell(player.id)
      return
    }

    const published: PlayerBodySchema = {
      spawn: player.spawn,
      position: vec3(body.translation()).toArray(),
    }
    state.setState(PLAYER.body, published)

    const safeDelta = Math.min(delta, 0.1)
    const velocity = body.linvel()
    // already still: let it sleep
    if (Math.hypot(velocity.x, velocity.z) > 0.01) {
      const damping = Math.exp(-DAMPING * safeDelta)
      body.setLinvel({ x: velocity.x * damping, y: velocity.y, z: velocity.z * damping }, true)
    }

    const angle = started ? joystickAngle(state) : null
    if (angle == null) return

    // scaled by the mass so the top speed is `SPEED`, whatever the collider
    const impulse = SPEED * DAMPING * body.mass() * safeDelta
    body.applyImpulse({ x: Math.sin(angle) * impulse, y: 0, z: Math.cos(angle) * impulse }, true)
  })

  return (
    <PlayerBody ref={bodyRef} gravityScale={5} position={initial}>
      <group ref={characterRef}>
        <Player {...playerProps} animate={walking} />
      </group>
    </PlayerBody>
  )
}

// other clients: kinematic body set to the published position
function SyncedPlayer(props: MatchPlayerProps) {
  const { player: _player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const { walking, characterRef } = useJoystick(state)
  const initial = useInitialPosition(props)

  useFrame(() => {
    const position = publishedBody(props)?.position
    if (!position) return
    const [x, y, z] = position
    bodyRef.current?.setTranslation({ x, y, z }, true)
  })

  return (
    <PlayerBody ref={bodyRef} type="kinematicPosition" position={initial}>
      <group ref={characterRef}>
        <Player {...playerProps} animate={walking} />
      </group>
    </PlayerBody>
  )
}
