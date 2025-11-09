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
    player: (index: number, radius: number = 1.8): Vector3Tuple => {
      const angle = MathUtils.degToRad(index * 25) // adjust spacing
      const x = (radius + index * 0.01) * Math.sin(angle)
      const y = (radius + index * 0.01) * Math.cos(angle)
      const z = index * 0.5 // step outward
      return [x, y, z]
    },
    tile: (() => {
      const cached = new Map<number, Vector3Tuple>()
      return (index: number, min = 10, max = 20): Vector3Tuple => {
        if (cached.has(index)) return cached.get(index)!
        const r = min + Math.random() * (max - min)
        const position: Vector3Tuple = [
          (Math.random() - 0.5) * 2 * r,
          (Math.random() - 0.5) * 2 * r,
          (Math.random() - 0.5) * 2 * r,
        ]
        cached.set(index, position)
        return position
      }
    })(),
  },
  game: {
    player(index: number, rowSize = 10, spacingX = 2, spacingY = 1.5): Vector3Tuple {
      const row = Math.floor(index / rowSize)
      const positionInRow = index % rowSize

      // zig-zag placement in x
      let x = 0
      if (positionInRow > 0) {
        const n = Math.ceil(positionInRow / 2)
        x = n * spacingX * (positionInRow % 2 === 1 ? -1 : 1)
      }

      // alternate forward/backward along z
      const direction = row % 2 === 0 ? 1 : -1
      const offset = row % 2 === 0 ? 0 : 1
      const z = (row + offset) * spacingY * direction

      const y = 10
      return [x + 1, y, z]
    },
  },
}
