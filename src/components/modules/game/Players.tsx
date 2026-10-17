import { Player, type PlayerProps } from '@components'
import { useGamePhase } from '@hooks'
import { latestBody, publishBodies, reportFell, simulateBody, useIsHost } from '@multiplayer'
import { useTransition } from '@react-spring/three'
import { useFrame } from '@react-three/fiber'
import { useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import { PLAYER, type PlayerBodySchema, type PlayerSchema } from '@schema'
import { useRoomState, useSoundBoard } from '@stores'
import { animatable, getGridSize } from '@utils'
import { myPlayer, usePlayersList, type PlayerState } from 'playroomkit'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { Quaternion, Vector3, type Group, type Vector3Tuple } from 'three'
import { PlayerBody } from './PlayerBody'

const FALL_LIMIT = -50
// walking: an impulse toward the joystick every physics step, against a strong damping.
// The players push each other through the physics contacts alone
const SPEED = 7
// horizontal only, so the falls keep the speed of gravity
const DAMPING = 12
// turning toward the joystick, smooth also when it snaps (keyboard)
const TURN_RATE = 5
const UP = new Vector3(0, 1, 0)

// prediction of the own player (other clients than the host): the host has it this much behind,
// the time for the input to get there and for its update to come back. An estimate
const HOST_LAG = 0.15 //s
// so a difference along the move within this much movement is timing, not divergence
const LAG_TOLERANCE = 0.1 //s
const MIN_TOLERANCE = 0.02
// share of the difference corrected at every host update, all of it from this far
const CORRECTION = 0.2
const SNAP_DISTANCE = 2
// below the floor: falling
const FALLING_HEIGHT = -1

// on the tiles, not dropping on them nor falling: the steps are heard
const GROUND_HEIGHT = 1.5
// the steps of the other players, quieter than the own ones
const OTHERS_VOLUME = 0.4
// every step a bit different
const STEP_VARIATION = 0.08

// the players pop in and drop one after the other, each within this long
const MAX_ENTER_DELAY = 600 //ms

// the other players follow their published bodies this fast
const FOLLOW_RATE = 15

// reused every frame
const _rotation = new Quaternion()
const _position = new Vector3()
const _target = new Vector3()

type Role = 'simulated' | 'predicted' | 'synced'

/**
 * Players of the match. The host simulates them all from their joystick (see `Controller`) and
 * publishes their positions (see `bodies.ts`). The other clients predict their own player
 * and follow the rest.
 * Every client turns the players toward their joystick angle.
 */
export function Players() {
  const players = useRoomState(s => s.players)
  const participants = usePlayersList()
  const host = useIsHost()

  useFrame(() => host && publishBodies())

  const transition = useTransition(players, {
    // a respawn is a new entrance, delayed too
    keys: player => `${player.id}-${player.spawn}`,
    from: { scale: 0 },
    enter: () => ({ scale: 1, delay: Math.random() * MAX_ENTER_DELAY }),
    leave: { scale: 0 },
    config: { mass: 1, tension: 200, friction: 20 },
  })

  return transition((spring, player) => {
    // the previous spawn of a respawned player: replaced right away, not shrinking
    if (players.some(p => p.id === player.id && p.spawn !== player.spawn)) return null

    const state = participants.find(p => p.id === player.id)
    const mine = player.id === myPlayer()?.id
    const role: Role = host ? 'simulated' : mine ? 'predicted' : 'synced'
    return (
      state && (
        <MatchPlayer
          player={player}
          state={state}
          role={role}
          username={player.username}
          color={player.color}
          pattern={player.pattern}
          patternColor={player.patternColor}
          eyeColor={player.eyeColor}
          showIndicator={mine}
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

const ROLES = { simulated: SimulatedPlayer, predicted: PredictedPlayer, synced: SyncedPlayer }

// the transition overrides the key of the elements it renders: the body is keyed here instead
const MatchPlayer = animatable(({ role, ...props }: MatchPlayerProps & { role: Role }) => {
  // still waiting for the delayed entrance: no body to drop yet
  if (props.scale === 0) return null

  // a new body when the role changes (e.g. after host migration)
  const RolePlayer = ROLES[role]
  return <RolePlayer key={role} {...props} />
})

// resume from the last published body (e.g. after host migration), from the spawn point otherwise
function useInitialPosition({ player }: MatchPlayerProps) {
  const [initial] = useState(() => latestBody(player.id, player.spawn)?.position ?? player.position)
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
  const walkingRef = useRef(false)
  const [walking, setWalking] = useState(false)

  useFrame((_, delta) => {
    const angle = started ? joystickAngle(state) : null
    if (walkingRef.current !== (angle != null)) {
      walkingRef.current = angle != null
      setWalking(walkingRef.current)
    }

    const character = characterRef.current
    if (angle == null || !character) return
    _rotation.setFromAxisAngle(UP, angle)
    character.quaternion.slerp(_rotation, Math.min(1, TURN_RATE * delta))
  })

  return { started, walking, characterRef }
}

// steps on the tiles and the landing on them, dropping from the spawn point, then the fall off
// the grid. Placed left to right across it
function usePlayerSounds(player: PlayerSchema, bodyRef: RefObject<RapierRigidBody | null>) {
  const dimension = useRoomState(s => s.dimension)
  // above the tiles at the last frame, unknown before the first one
  const airborneRef = useRef<boolean>(undefined)
  const fallenRef = useRef(false)

  const onGround = (y: number) => y > 0 && y < GROUND_HEIGHT

  const play = (name: 'step' | 'fall', x: number, rate?: number) =>
    useSoundBoard.getState().play(name, {
      pan: x / (getGridSize(dimension).x / 2 || 1),
      volume: player.id === myPlayer()?.id ? 1 : OTHERS_VOLUME,
      rate,
    })
  const step = (x: number) => play('step', x, 1 + (Math.random() * 2 - 1) * STEP_VARIATION)

  useFrame(() => {
    const position = bodyRef.current?.translation()
    if (!position) return

    if (airborneRef.current && onGround(position.y)) step(position.x)
    airborneRef.current = position.y >= GROUND_HEIGHT

    if (!fallenRef.current && position.y < FALLING_HEIGHT) {
      fallenRef.current = true
      play('fall', position.x)
    }
  })

  return () => {
    const position = bodyRef.current?.translation()
    if (position && onGround(position.y)) step(position.x)
  }
}

// walking toward the joystick angle (none: stopping), for a physics step
function walk(body: RapierRigidBody, angle: number | null, step: number) {
  const velocity = body.linvel()
  // already still: let it sleep
  if (Math.hypot(velocity.x, velocity.z) > 0.01) {
    const damping = Math.exp(-DAMPING * step)
    body.setLinvel({ x: velocity.x * damping, y: velocity.y, z: velocity.z * damping }, true)
  }

  if (angle == null) return

  // scaled by the mass so the top speed is `SPEED`, whatever the collider
  const impulse = SPEED * DAMPING * body.mass() * step
  body.applyImpulse({ x: Math.sin(angle) * impulse, y: 0, z: Math.cos(angle) * impulse }, true)
}

// host side: dynamic body moved by the player input, at the fixed physics rate whatever the frame rate
function SimulatedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const fellRef = useRef(false)
  const { started, walking, characterRef } = useJoystick(state)
  const initial = useInitialPosition(props)
  const onStep = usePlayerSounds(player, bodyRef)

  useEffect(() => simulateBody(player.id, player.spawn, bodyRef), [player.id, player.spawn])

  useBeforePhysicsStep(world => {
    const body = bodyRef.current
    if (!body || fellRef.current) return

    if (body.translation().y < FALL_LIMIT) {
      fellRef.current = true
      reportFell(player.id)
      return
    }

    walk(body, started ? joystickAngle(state) : null, world.timestep)
  })

  return (
    <PlayerBody ref={bodyRef} gravityScale={5} position={initial}>
      <group ref={characterRef}>
        <Player {...playerProps} animate={walking} onStep={onStep} />
      </group>
    </PlayerBody>
  )
}

/**
 * Moves the predicted body toward the host one, still the authority: horizontally only, the local
 * physics lands and walks on the same tiles (falls and landings are not in sync, e.g. at the start
 * the client drops from the spawn point later). Except when only one side fell.
 */
function correct(body: RapierRigidBody, [x, y, z]: Vector3Tuple) {
  const position = body.translation()
  const velocity = body.linvel()

  // fell on one side only: right to the host body, at rest
  if (y < FALLING_HEIGHT !== position.y < FALLING_HEIGHT) {
    body.setTranslation({ x, y, z }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    return
  }

  // where the host has it by now, if it kept moving as here
  const dx = x + velocity.x * HOST_LAG - position.x
  const dz = z + velocity.z * HOST_LAG - position.z
  const distance = Math.hypot(dx, dz)
  const tolerance = MIN_TOLERANCE + Math.hypot(velocity.x, velocity.z) * LAG_TOLERANCE
  if (distance <= tolerance) return

  // the part beyond the tolerance, a share at a time
  const share = distance > SNAP_DISTANCE ? 1 : ((distance - tolerance) / distance) * CORRECTION
  body.setTranslation(
    { x: position.x + dx * share, y: position.y, z: position.z + dz * share },
    true,
  )
}

// own player on the other clients: moved right away by the local input, corrected by the host
function PredictedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const correctedRef = useRef<PlayerBodySchema>(undefined)
  const { started, walking, characterRef } = useJoystick(state)
  const initial = useInitialPosition(props)
  const onStep = usePlayerSounds(player, bodyRef)

  useBeforePhysicsStep(world => {
    const body = bodyRef.current
    if (!body) return

    // once per host update
    const host = latestBody(player.id, player.spawn)
    if (host && host !== correctedRef.current) {
      correctedRef.current = host
      correct(body, host.position)
    }

    walk(body, started ? joystickAngle(state) : null, world.timestep)
  })

  return (
    <PlayerBody ref={bodyRef} gravityScale={5} position={initial}>
      <group ref={characterRef}>
        <Player {...playerProps} animate={walking} onStep={onStep} />
      </group>
    </PlayerBody>
  )
}

// the rest on the other clients: following the published bodies, solid for the predicted player
function SyncedPlayer(props: MatchPlayerProps) {
  const { player, state, ...playerProps } = props

  const bodyRef = useRef<RapierRigidBody>(null)
  const { walking, characterRef } = useJoystick(state)
  const initial = useInitialPosition(props)
  const onStep = usePlayerSounds(player, bodyRef)

  useBeforePhysicsStep(world => {
    const body = bodyRef.current
    const target = latestBody(player.id, player.spawn)
    if (!body || !target) return

    _target.fromArray(target.position)
    const follow = 1 - Math.exp(-FOLLOW_RATE * world.timestep)
    body.setNextKinematicTranslation(_position.copy(body.translation()).lerp(_target, follow))
  })

  return (
    <PlayerBody ref={bodyRef} type="kinematicPosition" position={initial}>
      <group ref={characterRef}>
        <Player {...playerProps} animate={walking} onStep={onStep} />
      </group>
    </PlayerBody>
  )
}
