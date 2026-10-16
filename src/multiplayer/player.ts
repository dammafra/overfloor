import type { PlayerProfileSchema } from '@schema'
import type { PlayerState } from 'playroomkit'

export function playerProfile(player: PlayerState): PlayerProfileSchema {
  // no color if the profile one is not a hex color
  const { name, color } = player.getProfile()
  return { id: player.id, username: name, color: color?.hexString }
}
