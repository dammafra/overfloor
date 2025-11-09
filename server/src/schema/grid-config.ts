export const gridConfig = {
  large: {
    width: 11,
    height: 8,
    playersPerRow: 11,
    maxPlayers: 55,
  },
  medium: {
    width: 9,
    height: 6,
    playersPerRow: 7,
    maxPlayers: 21,
  },
  small: {
    width: 7,
    height: 4,
    playersPerRow: 5,
    maxPlayers: 15,
  },
}

export type GridDimension = keyof typeof gridConfig
