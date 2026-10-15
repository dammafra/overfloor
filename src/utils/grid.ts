import { GRID_STEP, gridConfig, type GridDimension } from '@schema'
import type { Vector3Tuple } from 'three'

// world size of the grid along x and z
export function getGridSize(dimension?: GridDimension) {
  if (!dimension) return { x: 0, z: 0 }
  const { width, height } = gridConfig[dimension]
  return { x: width * GRID_STEP, z: height * GRID_STEP }
}

export function getGridCoordinates(width: number, height: number): [number, number][] {
  const offsetX = (width - 1) * GRID_STEP * 0.5
  const offsetZ = (height - 1) * GRID_STEP * 0.5

  const coordinates: [number, number][] = []
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      coordinates.push([i * GRID_STEP - offsetX, j * GRID_STEP - offsetZ])
    }
  }

  return coordinates
}

export function getPlayerInitialPosition(index: number, dimension: GridDimension): Vector3Tuple {
  const spacingX = 2
  const spacingY = 1.5
  const rowSize = gridConfig[dimension].playersPerRow
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
  return [x, y, z]
}
