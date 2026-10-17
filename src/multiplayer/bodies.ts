import type { RapierRigidBody } from '@react-three/rapier'
import { STATE, type BodiesSchema } from '@schema'
import { setState } from 'playroomkit'
import type { RefObject } from 'react'
import type { Vector3Tuple } from 'three'

/**
 * Positions of the match players. The host simulates the bodies and publishes them all together,
 * in a single room state update a few times per second: a player state per body every frame
 * would be relayed to every client, i.e. players² messages per frame.
 */
const PUBLISH_INTERVAL = 50 //ms, 20 updates per second
// bodies at rest are published less often, still enough for the predictions to settle
const REST_INTERVAL = 250 //ms

// centimeters are enough, and keep the updates short
const quantize = (value: number) => Math.round(value * 100) / 100

// host side: the bodies it simulates, by player id. Refs: Rapier may recreate a body
const simulated = new Map<string, { spawn: string; body: RefObject<RapierRigidBody | null> }>()
let publishedAt = 0
let sentAt = 0
let lastPublished = ''

// every client: the last update
let received: BodiesSchema = {}

// host only: publishes the body until the returned cleanup
export function simulateBody(id: string, spawn: string, body: RefObject<RapierRigidBody | null>) {
  const entry = { spawn, body }
  simulated.set(id, entry)
  return () => {
    if (simulated.get(id) === entry) simulated.delete(id)
  }
}

// host only: the body simulated right now, e.g. for the bots
export function simulatedPosition(id: string, spawn: string): Vector3Tuple | undefined {
  const entry = simulated.get(id)
  const body = entry?.spawn === spawn ? entry.body.current : undefined
  if (!body) return
  const { x, y, z } = body.translation()
  return [x, y, z]
}

// host only, called every frame: publishes the bodies at the publish interval, less often at rest
export function publishBodies() {
  const now = performance.now()
  if (now - publishedAt < PUBLISH_INTERVAL) return
  publishedAt = now

  const bodies: BodiesSchema = {}
  simulated.forEach(({ spawn, body }, id) => {
    if (!body.current) return
    const { x, y, z } = body.current.translation()
    bodies[id] = { spawn, position: [quantize(x), quantize(y), quantize(z)] }
  })

  const serialized = JSON.stringify(bodies)
  if (serialized === lastPublished && now - sentAt < REST_INTERVAL) return
  lastPublished = serialized
  sentAt = now

  setState(STATE.bodies, bodies, false)
}

export function receiveBodies(bodies?: BodiesSchema) {
  received = bodies ?? {}
}

// last published body of the player, if it belongs to the spawn. A new object at every update
export function latestBody(id: string, spawn: string) {
  const body = received[id]
  return body?.spawn === spawn ? body : undefined
}

export function resetBodies() {
  simulated.clear()
  publishedAt = 0
  sentAt = 0
  lastPublished = ''
  received = {}
}
