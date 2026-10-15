import { PLAYER } from '@schema'
import { myPlayer } from 'playroomkit'

/**
 * Round trip of the own input: each input is numbered, the host echoes the last one it applied in
 * the published body (`PlayerBodySchema.ack`). Used to predict the own player and to extrapolate the others.
 */
const DEFAULT_RTT = 100 //ms
const RTT_SMOOTHING = 0.2

const sentAt = new Map<number, number>()
let seq = 0
let lastAck = 0
let rtt = DEFAULT_RTT

// the input is the direction as a y-axis angle, `null` when idle (see `Controller`)
export function sendInput(angle: number | null) {
  const player = myPlayer()
  if (!player) return

  seq++
  sentAt.set(seq, performance.now())
  // the sequence after the input: the host never echoes it before having the input
  player.setState(PLAYER.input, angle, true)
  player.setState(PLAYER.inputSeq, seq, true)
}

// a published body of the own player, sampled only the first time its input is acknowledged
export function ackInput(ack: number | undefined) {
  if (ack == null || ack <= lastAck) return
  lastAck = ack

  const sent = sentAt.get(ack)
  for (const s of sentAt.keys()) if (s <= ack) sentAt.delete(s)
  if (sent != null) rtt += (performance.now() - sent - rtt) * RTT_SMOOTHING
}

export function getRtt() {
  return rtt
}
