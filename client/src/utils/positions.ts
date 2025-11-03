import { MathUtils, type Vector3Tuple } from 'three'

export const positions = {
  ui: {
    tile: (index: number, size: number): Vector3Tuple => {
      const spacing = 1.1
      const x = (index % size) - (size - 1) / 2
      const z = Math.floor(index / size) - (size - 1) / 2
      return [x * spacing, 0, z * spacing]
    },
  },
  lobby: {
    player: (index: number, radius: number = 1.5): Vector3Tuple => {
      const angle = MathUtils.degToRad(index * 30) // adjust spacing
      const x = radius * Math.sin(angle)
      const y = radius * Math.cos(angle)
      const z = index * 0.5 // step outward
      return [x, y, z]
    },
  },
  game: {
    player: (index: number, radius: number = 1.5): Vector3Tuple => {
      const angle = MathUtils.degToRad(index * 60) // spacing
      const x = radius * Math.cos(angle)
      const z = radius * Math.sin(angle)
      const y = 4 // constant height
      return [x, y, z]
    },
  },
}
