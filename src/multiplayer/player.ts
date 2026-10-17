import type { PlayerProfileSchema } from '@schema'
import { isHexColor, isPattern } from '@utils'
import type { PlayerProfile as PlayroomProfile, PlayerState } from 'playroomkit'

// Playroom keeps the extra fields of the profile as they are
type PlayerProfile = PlayroomProfile & {
  pattern?: unknown
  patternColor?: unknown
  eyeColor?: unknown
}

export function playerProfile(player: PlayerState): PlayerProfileSchema {
  // no color if the profile one is not a hex color
  const { name, color, pattern, patternColor, eyeColor } = player.getProfile() as PlayerProfile
  return {
    id: player.id,
    username: name,
    color: color?.hexString,
    // left out when invalid
    ...(isPattern(pattern) && { pattern }),
    ...(isPattern(pattern) && isHexColor(patternColor) && { patternColor }),
    ...(isHexColor(eyeColor) && { eyeColor }),
  }
}
